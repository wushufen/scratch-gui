/* eslint-disable no-loop-func */
// import largeStageIcon from './icon--large-stage.svg';
// import smallStageIcon from './icon--small-stage.svg';
// import unFullScreenIcon from './icon--unfullscreen.svg';
import unFullScreenIcon from '@/assets/icons/close.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {connect} from 'react-redux';
import VM from 'scratch-vm';
import Icon from '../../assets/icons/icon.jsx';
import Controls from '../../containers/controls.jsx';
import {STAGE_SIZE_MODES} from '../../lib/layout-constants';
// import {getStageDimensions} from '../../lib/screen-utils';
import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import scratchLogo from '../menu-bar/scratch-logo.svg';
import fullScreenIcon from './icon--fullscreen.png';
import styles from './stage-header.css';


const messages = defineMessages({
    largeStageSizeMessage: {
        defaultMessage: 'Switch to large stage',
        description: 'Button to change stage size to large',
        id: 'gui.stageHeader.stageSizeLarge'
    },
    smallStageSizeMessage: {
        defaultMessage: 'Switch to small stage',
        description: 'Button to change stage size to small',
        id: 'gui.stageHeader.stageSizeSmall'
    },
    fullStageSizeMessage: {
        defaultMessage: 'Enter full screen mode',
        description: 'Button to change stage size to full screen',
        id: 'gui.stageHeader.stageSizeFull'
    },
    unFullStageSizeMessage: {
        defaultMessage: 'Exit full screen mode',
        description: 'Button to get out of full screen mode',
        id: 'gui.stageHeader.stageSizeUnFull'
    },
    fullscreenControl: {
        defaultMessage: 'Full Screen Control',
        description: 'Button to enter/exit full screen mode',
        id: 'gui.stageHeader.fullscreenControl'
    }
});

const StageHeaderComponent = function (props) {
    const {
        isFullScreen,
        isPlayerOnly,
        onKeyPress,
        // onSetStageLarge,
        // onSetStageSmall,
        onSetStageFull,
        onSetStageUnFull,
        showBranding,
        stageMode,
        onSetStageMode,
        vm
    } = props;

    let header = null;
    let stageModeContent = null;
    if (isFullScreen) {
        // const stageDimensions = getStageDimensions(null, true);
        const stageButton = showBranding ? (
            <div className={styles.embedScratchLogo}>
                <a
                    href="https://scratch.mit.edu"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <img
                        alt="Scratch"
                        src={scratchLogo}
                    />
                </a>
            </div>
        ) : (
            <Button
                className={styles.stageButton}
                onClick={onSetStageUnFull}
                onKeyPress={onKeyPress}
            >
                <img
                    alt={props.intl.formatMessage(messages.unFullStageSizeMessage)}
                    className={styles.stageButtonIcon}
                    draggable={false}
                    src={unFullScreenIcon}
                    title={props.intl.formatMessage(messages.fullscreenControl)}
                />
            </Button>
        );
        header = (
            <Box className={styles.stageHeaderWrapperOverlay}>
                <Box
                    className={styles.stageMenuWrapper}
                >
                    {stageButton}
                    <Controls vm={vm} />
                </Box>
            </Box>
        );
    } else {
        const stageModeItem = [];
        if (!isPlayerOnly){

            for (const key in STAGE_SIZE_MODES) {
                stageModeItem.push(<div key={key}>
                    <Button
                        type="button"
                        className={classNames(styles.stageModeItem)}
                        name={key}
                        onClick={() => {
                            onSetStageMode(key); stageModeContent ? stageModeContent.style = 'display:none' : null;
                        }}
                    >
                        {STAGE_SIZE_MODES[key]}
                    </Button>
                </div>);
            }
        }
        const stageControls =
            isPlayerOnly ? (
                []
            ) : (
                <div className={classNames(styles.stageSizeModeGroup)}>
                    <div
                        className={classNames(styles.stageModeContent)}
                        ref={ref => {
                            stageModeContent = ref;
                        }}
                    >
                        {stageModeItem}
                    </div>
                    <div
                        className={classNames(styles.stageMode)}
                        onMouseEnter={() => {
                            stageModeContent ? stageModeContent.style = null : null;
                        }}
                    >
                        {STAGE_SIZE_MODES[stageMode]}
                    </div>
                </div>
            );
        header = (
            <Box className={styles.stageHeaderWrapper}>
                <Box className={styles.stageMenuWrapper}>
                    {stageControls}
                    {/* 全屏 */}
                    <button
                        hidden={isPlayerOnly}
                        className={classNames(styles.iconWrap, styles.fullStageBtn)}
                        onClick={onSetStageFull}
                    >
                        <img
                            alt={props.intl.formatMessage(messages.fullStageSizeMessage)}
                            className={styles.stageButtonIcon}
                            draggable={false}
                            src={fullScreenIcon}
                            title={props.intl.formatMessage(messages.fullscreenControl)}
                        />
                    </button>
                    {/* 显示/隐藏 角色 */}
                    {
                        !vm.editingTarget?.isStage && vm.editingTarget?.visible ?
                            <button
                                hidden={isPlayerOnly}
                                className={classNames(styles.iconWrap)}
                                onClick={e => vm.postSpriteInfo({visible: false})}
                            >
                                <Icon
                                    name="show"
                                    className={styles.stageButtonIcon}
                                />
                            </button> :
                            <button
                                hidden={isPlayerOnly}
                                className={classNames(styles.iconWrap)}
                                onClick={e => vm.postSpriteInfo({visible: true})}
                            >
                                <Icon
                                    name="hide"
                                    className={styles.stageButtonIcon}
                                />
                            </button>
                    }
                    <Controls
                        isPlayerOnly={isPlayerOnly}
                        vm={vm}
                    />
                </Box>
            </Box>
        );
    }

    return header;
};

const mapStateToProps = state => ({
    // This is the button's mode, as opposed to the actual current state
    // stageSizeMode: state.scratchGui.stageSize.stageSize,
    sprites: state.scratchGui.targets.sprites,
});

StageHeaderComponent.propTypes = {
    intl: intlShape,
    isFullScreen: PropTypes.bool.isRequired,
    isPlayerOnly: PropTypes.bool.isRequired,
    onKeyPress: PropTypes.func.isRequired,
    onSetStageFull: PropTypes.func.isRequired,
    // onSetStageLarge: PropTypes.func.isRequired,
    // onSetStageSmall: PropTypes.func.isRequired,
    onSetStageUnFull: PropTypes.func.isRequired,
    showBranding: PropTypes.bool.isRequired,
    stageMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired
};

StageHeaderComponent.defaultProps = {
    stageMode: 'portrait_9_16'
};

export default injectIntl(connect(
    mapStateToProps
)(StageHeaderComponent));
