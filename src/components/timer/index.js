/* eslint-disable no-invalid-this */
import {OPERATE_TIME_1, OPERATE_TIME_2, CODE_TIME_1, timerType} from './data';
class Timer {
    constructor (type) {
        this.state = '';
        this.codeTimer = null; // 代码计时器
        this.operateTimer1 = null; // 操作计时器1
        this.operateTimer2 = null; // 操作计时器2
        this.type = type; // 计时器类型
        this.createOperateTimer = null;
        this.createCodeTimer = null;
        this.pauseOperateTimer = null;
        this.pauseCodeTimer = null;
        this.iniTimertListener(); // 初始化计时器监听器
        this.initUserHandleListener(); // 初始化用户点击事件的监听
    }
    static isHasUserHandleListener = false // 避免重复初始化用户点击的监听
    initUserHandleListener = () => {
        window.addEventListener('click', this.resetTimer, true);
        const blocklyWorkspaces = Array.from(document.getElementsByClassName('blocklyWorkspace'));
        blocklyWorkspaces.forEach(item => {
            item.addEventListener('touchstart', this.resetTimer, true);
        });
    }

    iniTimertListener = () => {
        switch (this.type) {
        case timerType.CODE:
            this.createCodeTimer = () => { // 监听创建代码计时器事件
                if (this.state === 'exist') return;
                console.log('创建代码计时器');
                this.createTimer(); // 开始计时
            };
            this.pauseCodeTimer = () => { // 监听终止代码计时器事件
                if (this.state === '') return;
                console.log('终止代码计时器');
                this.pauseTimer(); // 终止计时器
            };
            window.addEventListener('libraryBack', this.createCodeTimer); // 关闭资源库
            window.addEventListener('selectSprite', this.createCodeTimer); // 选择精灵
            window.addEventListener('hideEditingTarget', this.createCodeTimer); // 关闭画板界面
            window.addEventListener('noVideoGuide', this.createCodeTimer); // 没有视频引导
            window.addEventListener('closeVideoGuide', this.createCodeTimer); // 关闭视频引导
            window.addEventListener('closeVideoTips', this.createCodeTimer); // 关闭视频提示
            window.addEventListener('projectRunFinish', this.createCodeTimer); // 代码运行结束
            
            window.addEventListener('editSprite', this.pauseCodeTimer); // 编辑精灵
            window.addEventListener('editStage', this.pauseCodeTimer); // 编辑舞台
            window.addEventListener('onNewSpriteClick', this.pauseCodeTimer); // 选择精灵
            window.addEventListener('paintSprite', this.pauseCodeTimer); // 绘制
            window.addEventListener('clickVideoTips', this.pauseCodeTimer); // 点击提示视频
            window.addEventListener('projectRunning', this.pauseCodeTimer); // 代码运行中
            break;
        case timerType.OPERATE:
            this.createOperateTimer = () => { // 监听创建操作计时器事件
                if (this.state === 'exist') return;
                console.log('创建操作计时器');
                this.createTimer(); // 开始计时
            };
            this.pauseOperateTimer = () => { // 监听终止操作计时器事件
                if (this.state === '') return;
                console.log('终止操作计时器');
                this.pauseTimer(); // 终止计时器
            };
            window.addEventListener('noVideoGuide', this.createOperateTimer); // 没有视频引导
            window.addEventListener('closeVideoGuide', this.createOperateTimer); // 关闭视频引导
            window.addEventListener('closeVideoTips', this.createOperateTimer); // 关闭视频提示
            window.addEventListener('projectRunFinish', this.createOperateTimer); // 代码运行结束
            window.addEventListener('clickVideoTips', this.pauseOperateTimer); // 点击提示视频
            window.addEventListener('projectRunning', this.pauseOperateTimer); // 代码运行中
            window.addEventListener('pauseOperateTimer', this.pauseOperateTimer);
            break;
        }
    }
   
    createTimer = () => {
        this.state = 'exist';
        switch (this.type) {
        case timerType.CODE:
            this.codeTimer = setInterval(() => {
                window.dispatchEvent(new Event(`noAction:${this.type}:${CODE_TIME_1}`));
            }, CODE_TIME_1);
            break;
        case timerType.OPERATE:
            this.operateTimer1 = setTimeout(() => {
                window.dispatchEvent(new Event(`noAction:${this.type}:${OPERATE_TIME_1}`));
                clearTimeout(this.operateTimer1);
                this.operateTimer2 = setTimeout(() => { // OPERATE_TIME_1秒后再触发OPERATE_TIME_2后的事件
                    window.dispatchEvent(new Event(`noAction:${this.type}:${OPERATE_TIME_2}`));
                    clearTimeout(this.operateTimer2);
                    this.createTimer();
                }, OPERATE_TIME_2);
            }, OPERATE_TIME_1);
            break;
        default:
            break;
        }
    }
    resetTimer = () => {
        switch (this.type) {
        case timerType.CODE:
            this.codeTimer && clearInterval(this.codeTimer);
            break;
        case timerType.OPERATE:
            this.operateTimer1 && clearTimeout(this.operateTimer1);
            this.operateTimer2 && clearTimeout(this.operateTimer2);
            break;
        default:
            break;
        }
        if (this.state === '') return; // 重置计时器是在计时器已经存在的基础上
        this.createTimer();
    }
    pauseTimer = () => {
        this.state = '';
        switch (this.type) {
        case timerType.CODE:
            this.codeTimer && clearInterval(this.codeTimer);
            break;
        case timerType.OPERATE:
            this.operateTimer1 && clearTimeout(this.operateTimer1);
            this.operateTimer2 && clearTimeout(this.operateTimer2);
            break;
        default:
            break;
        }
    }

    removeListener = () => {
        switch (this.type) {
        case timerType.CODE:
            window.removeEventListener('libraryBack', this.createCodeTimer);
            window.removeEventListener('selectSprite', this.createCodeTimer);
            window.removeEventListener('hideEditingTarget', this.createCodeTimer);
            window.removeEventListener('noVideoGuide', this.createCodeTimer);
            window.removeEventListener('closeVideoGuide', this.createCodeTimer);
            window.removeEventListener('closeVideoTips', this.createCodeTimer);
            window.removeEventListener('projectRunFinish', this.createCodeTimer);
            window.removeEventListener('editSprite', this.pauseCodeTimer);
            window.removeEventListener('editStage', this.pauseCodeTimer);
            window.removeEventListener('onNewSpriteClick', this.pauseCodeTimer);
            window.removeEventListener('paintSprite', this.pauseCodeTimer);
            window.removeEventListener('clickVideoTips', this.pauseCodeTimer);
            window.removeEventListener('projectRunning', this.pauseCodeTimer);
            break;
        case timerType.OPERATE:
            window.removeEventListener('noVideoGuide', this.createOperateTimer); // 没有视频引导
            window.removeEventListener('closeVideoGuide', this.createOperateTimer); // 关闭视频引导
            window.removeEventListener('closeVideoTips', this.createOperateTimer);
            window.removeEventListener('projectRunFinish', this.createOperateTimer);
            window.removeEventListener('clickVideoTips', this.pauseOperateTimer);
            window.removeEventListener('pauseOperateTimer', this.pauseOperateTimer);
            window.removeEventListener('projectRunning', this.pauseOperateTimer);
            break;
        default:
            break;
        }
        window.removeEventListener('click', this.resetTimer, true);
    }
}


export default Timer;
