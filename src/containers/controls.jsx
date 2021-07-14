import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';

import {ajax} from '../lib/ajax.js';

class Controls extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleGreenFlagClick',
            'handleStopAllClick'
        ]);
        this.setOnNativeCallJsInWindow();
    }

    setOnNativeCallJsInWindow () {
        window.onNativeCallJs = mess => {
            console.log('onNativeCallJs params---', mess);
            try {
                const code = mess.code;
                const data = mess.data;
                switch (code) {
                case 1:
                    // 1：生命周期协议
                    var life = data.lifecycle;
                    if (life === 'onPause') {
                        // webview页面暂停，即将进入后台
                        console.log('to stop');
                        this.props.vm.stopAll();
                    } else if (life === 'onResume') {
                        // webview页面即将进入前台
                        console.log('to start');
                        this.props.vm.start();
                    }
                    break;
                default:
                    break;
                }
            } catch (error) {
                console.error('onNativeCallJs error---', error);
            }
        };
    }

    handleGreenFlagClick (e) {
        e.preventDefault();
        if (e.shiftKey) {
            this.props.vm.setTurboMode(!this.props.turbo);
        } else {
            if (!this.props.isStarted) {
                this.props.vm.start();
            }
            this.props.vm.greenFlag();
        }

        this.checkWork();
    }
    handleStopAllClick (e) {
        e.preventDefault();
        this.props.vm.stopAll();
    }
    async checkWork () {
        if (window._workInfo) {
            var json = this.props.vm.toJSON();
            if (this.lastVmJSON === json) {
                return;
            }
            this.lastVmJSON = json;
            
            var {data} = await ajax.post('hwUserWork/autoAnalyst', {
                workCode: window._workInfo.workCode,
                projectJsonStr: json,
            });

            if (data == 1) {
                dispatchEvent(new Event('运行时判断正确'));
            } else {
                dispatchEvent(new Event('运行时判断不正确'));
            }
        }

    }
    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            isStarted, // eslint-disable-line no-unused-vars
            projectRunning,
            turbo,
            ...props
        } = this.props;
        return (
            <ControlsComponent
                {...props}
                active={projectRunning}
                turbo={turbo}
                onGreenFlagClick={this.handleGreenFlagClick}
                onStopAllClick={this.handleStopAllClick}
            />
        );
    }
}

Controls.propTypes = {
    isStarted: PropTypes.bool.isRequired,
    projectRunning: PropTypes.bool.isRequired,
    turbo: PropTypes.bool.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    isStarted: state.scratchGui.vmStatus.running,
    projectRunning: state.scratchGui.vmStatus.running,
    turbo: state.scratchGui.vmStatus.turbo
});
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
