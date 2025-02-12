import JSZip from 'jszip';
import {ajax} from './ajax.js';
import {param} from './param.js';
import Dialog from './../components/dialog/index.jsx';
const Zip = JSZip;

let vm;

// WARNING: sb3 内文件名必须是文件的 md5 ，如果不一致加载会找不到

/**
 * single
 */
class Project {
    url = ''

    jsonAddon = { // project.json +
        // 保存当前角色
        get _editingTargetName () {
            return vm.editingTarget?.getName();
        }
    }

    cache = {
        // key: 'value'
        // 'url.sb3': ['asset.png', '...']
    }

    getZipAssetNames (zip) {
        return Object.keys(zip.files);
    }

    /**
     * 获取拆分包
     * @returns {Promise<Blob>} blob
     */
    getSb3Diff () {
        // console.time('getSb3Diff');

        // init url
        if (!this._originalFileURL) {
            this._originalFileURL = this.url;
        }

        // !diff
        if (param('mode') !== 'course') this._originalFileURL = null;
        if (!/interactiveTemplate/.test(this._originalFileURL)) this._originalFileURL = null;
        if (!/\.sb3$/.test(this._originalFileURL)) this._originalFileURL = null;

        // .sb3
        if (!this._originalFileURL) {
            return this.getSb3();
        }

        // diff
        const _zipAssetNames = this.cache[this._originalFileURL];
        const zip = this.getSb3Zip();

        if (!_zipAssetNames) {
            return this.getSb3();
        }

        // - _zip.files
        for (const file in zip.files) {
            if (_zipAssetNames.indexOf(file) !== -1) {
                delete zip.files[file];
            }
        }

        // project.json + _originalFileURL
        this.jsonAddon._originalFileURL = this._originalFileURL;
        var json = vm.toJSON();
        zip.file('project.json', json);

        // console.timeEnd('getSb3Diff');
        console.log('[getSb3Diff]', JSON.parse(json), zip);

        return zip.generateAsync({
            type: 'blob',
            mimeType: 'application/x.scratch.sb3diff',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6 // Tradeoff between best speed (1) and best compression (9)
            }
        });
    }

    getSb3Zip () {
        var zip = new JSZip();
        this.zip = zip;

        var json = vm.toJSON();
        zip.file('project.json', json);

        vm.assets.forEach(asset => {
            zip.file(`${asset.assetId}.${asset.dataFormat}`, asset.data);
        });

        return zip;
    }

    // => blob
    getSb3 () {
        var zip = this.getSb3Zip();

        return zip.generateAsync({
            type: 'blob',
            mimeType: 'application/x.scratch.sb3',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6 // Tradeoff between best speed (1) and best compression (9)
            }
        });
    }

    /**
     * sb3diff => sb3
     * @param {ArrayBuffer} buffer buffer
     * @returns {ArrayBuffer} buffer
     */
    async mergeSb3diff (buffer) {
        let zip = await this.buffer2zip(buffer);
        const projectConfig = await this.getZipProjectConfig(zip);
        console.info('projectConfig:', projectConfig);
        this.projectConfig = projectConfig;
        const _originalFileURL = projectConfig._originalFileURL;
        let isError;

        // url => ['asset.png', ...]
        if (buffer.url) {
            this.cache[buffer.url] = this.getZipAssetNames(zip);
        }

        // {.sb3diff project.json}._originalFileURL
        if (_originalFileURL) {
            // file:///
            const _zip = await this.url2zip(_originalFileURL);
            zip = this.mergeZip(_zip, zip);
            console.log('[mergeSb3diff] _originalFileURL:', _originalFileURL, _zip);
            isError = await this.hasAssetsError(zip);

            // {.sb3diff project.json}._originalFileURL
            if (!isError) {
                this._originalFileURL = _originalFileURL;
                this.cache[_originalFileURL] = this.getZipAssetNames(_zip);
            }

            // ._originalFileURL 指向错误
            if (isError) {
                const fixedURL = this.fixOriginalFileURL(_originalFileURL);
                const fixedZip = await this.url2zip(fixedURL);
                zip = this.mergeZip(fixedZip, zip);
                console.warn('[mergeSb3diff] fixedURL:', fixedURL, fixedZip);
                isError = await this.hasAssetsError(zip);
            }

            // 回退 _originalFileURL
            if (isError) {
                zip = _zip;
                console.error('[mergeSb3diff] back to _originalFileURL', zip);
                isError = await this.hasAssetsError(zip);
            }
        }

        // 回退 param('file')
        if (isError) {
            const url = param('file');
            if (url) {
                zip = await this.url2zip(url);
                console.error('[mergeSb3diff] back to param("file")', zip);
                isError = await this.hasAssetsError(zip);
            }
        }

        // 回退 default.sb3
        if (isError) {
            const defaultSb3URL = require('!file-loader!../lib/default-project/sb3/default.sb3');
            zip = await this.url2zip(defaultSb3URL);
            console.error('[mergeSb3diff] back to default.sb3');
        }

        return zip.generateAsync({
            type: 'arraybuffer',
        });
    }

    mergeZip (_zip, zip) {
        const __zip = new Zip();
        __zip.files = {
            ..._zip?.files,
            ...zip?.files,
        };
        return __zip;
    }

    url2buffer (url) {
        if (!url) return null;

        return new Promise(rs => {
            ajax.get(url, {}, {
                retry: 1,
                responseType: 'blob',
                base: '',
                async onload (res) {
                    const buffer = await res.arrayBuffer();
                    rs(buffer);
                },
                onerror (){
                    rs(null);
                }
            });
        });
    }

    buffer2zip (buffer) {
        if (!buffer) return null;

        return Zip.loadAsync(buffer);
    }

    async url2zip (url) {
        if (!url) return null;

        let buffer = await this.url2buffer(url);

        // local2onlineURL
        if (!/^http/.test(url) && !buffer) {
            url = this.local2onlineURL(url);
            console.log('local2onlineURL:', url);
            buffer = await this.url2buffer(url);
        }

        const zip = await this.buffer2zip(buffer);
        return zip;
    }

    async getZipProjectConfig (zip) {
        const json = await zip.file('project.json').async('string');
        const projectConfig = JSON.parse(json);
        return projectConfig;
    }

    async hasAssetsError (zip) {
        if (!zip) return true;

        const projectConfig = await this.getZipProjectConfig(zip);
        const targets = projectConfig.targets;
        const assets = [];
        targets.forEach(t => assets.push(...t.costumes, ...t.sounds));

        let isError = false;
        const errorAssets = [];
        for (const asset of assets) {
            if (!zip.file(asset.md5ext)) {
                isError = true;
                errorAssets.push(asset);
                // return true;
            }
        }

        if (isError) {
            console.error('[checkAssetsError] !asset', zip, errorAssets);
        } else {
            console.info('[checkAssetsError] success');
        }
        return isError;
    }

    /**
     * file:///.../{WORK_CODE}/scratch/{FILE}.sb3
     *
     * https://oss.wit-learn.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease/{WORK_CODE}/scratch/{FILE}.sb3
     * https://oss.iandcode.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease/{WORK_CODE}/scratch/{FILE}.sb3
     *
     * @param {string} file file:///
     * @returns {string} url
     */
    local2onlineURL (file) {
        var url = file;
        var path = file
            .replace(/[\\/]+/g, '/') // fuck //\\ => /
            .match(/[/][^/]+[/]scratch[/][^/]+$/)?.[0];

        if (path && !/^http/.test(file)) { // !(!file:///)
            if (param('base') === 'dev') {
                url = `https://oss.wit-learn.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease${path}`;
            } else if (param('base') === 'uat') {
                url = `https://oss.wit-learn.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease${path}`;
            } else {
                url = `https://oss.iandcode.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease${path}`;
            }
        }

        return url;
    }

    fixOriginalFileURL (url) {
        /**
        猫女侠继承重做
        继承关系往下
        7： https://oss.iandcode.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease/L1-U01-3/scratch/cat-heroine-practice-2-04.sb3 | -01
        8： https://oss.iandcode.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease/L1-U01-3/scratch/cat-heroine-practice-3-03.sb3 | -01
        9： https://oss.iandcode.com/s/platform/interactive/common/interactiveTemplate/wdProj/moduleRelease/L1-U01-3/scratch/cat-heroine-practice-4-03.sb3 | -1
        */

        url = url
            .replace('L1-U01-3/scratch/cat-heroine-practice-2-04.sb3', 'L1-U01-3/scratch/cat-heroine-practice-2-01.sb3')
            .replace('L1-U01-3/scratch/cat-heroine-practice-3-03.sb3', 'L1-U01-3/scratch/cat-heroine-practice-3-01.sb3')
            .replace('L1-U01-3/scratch/cat-heroine-practice-4-03.sb3', 'L1-U01-3/scratch/cat-heroine-practice-4-1.sb3');
        url = this.local2onlineURL(url);
        return url;
    }

    async resetProjectByFileParam () {
        await Dialog.confirm({
            title: '重做确认',
            content: '将会清空当前作品记录，重新开始创作哦，是否确定重做？'
        });

        var file = param('file');
        const buffer = await this.url2buffer(file);

        vm.loadProject(buffer);
    }

}

const project = new Project();

/**
 * inject: vm.toJSON, vm.loadProject
 * @param {VM} _vm vm
 */
function injectVm (_vm) {
    console.log('[injectVm]');
    vm = _vm;

    // TODO remove: src\lib\blocks_teacher_mode.js vm.toJSON
    // inject toJSON
    var toJSON = vm.toJSON;
    vm.toJSON = function () {
        var json = toJSON.apply(this, arguments);
        json = JSON.parse(json);

        json = {
            ...json,
            ...project.jsonAddon,
        };

        return JSON.stringify(json);
    };

    // inject loadProject
    if (!vm._loadProject) {
        vm._loadProject = vm.loadProject;
        vm.loadProject = async function (_buffer) {
            console.log('[injectVm] vm.loadProject');
            const buffer = await project.mergeSb3diff(_buffer);
            return vm._loadProject(buffer);
        };
    }


    // TODO
    vm.runtime.on(vm.runtime.constructor.PROJECT_LOADED, e => {
        console.log('PROJECT_LOADED', project.projectConfig);

        // 默认选中保存时选中的角色
        var _editingTarget = vm.runtime.targets.find(e => e.sprite.name === project.projectConfig._editingTargetName);
        vm.setEditingTarget(_editingTarget?.id);
    });
}

export {
    project as default,
    project,
    injectVm,
};

// dev
window.project = project;
