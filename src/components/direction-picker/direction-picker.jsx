/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Popover from 'react-popover';
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl';

import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import Dial from './dial.jsx';

import styles from './direction-picker.css';

import allAroundIcon from './around.svg';
import leftRightIcon from './left-right.svg';
import dontRotateIcon from './dont-rotate.svg';
import selectedAround from './selected-around.svg';
import selectedLeftRight from './selected-left-right.svg';
import selectedDontRotate from './selected-dont-rotate.svg';

import closeIcon from './icon--close.svg';

const BufferedInput = BufferedInputHOC(Input);

const directionLabel = (
    <FormattedMessage
        defaultMessage="Direction"
        description="Sprite info direction label"
        id="gui.SpriteInfo.direction"
    />
);

const RotationStyles = {
    ALL_AROUND: 'all around',
    LEFT_RIGHT: 'left-right',
    DONT_ROTATE: "don't rotate"
};

const messages = defineMessages({
    allAround: {
        id: 'gui.directionPicker.rotationStyles.allAround',
        description: 'Button to change to the all around rotation style',
        defaultMessage: 'All Around'
    },
    leftRight: {
        id: 'gui.directionPicker.rotationStyles.leftRight',
        description: 'Button to change to the left-right rotation style',
        defaultMessage: 'Left/Right'
    },
    dontRotate: {
        id: 'gui.directionPicker.rotationStyles.dontRotate',
        description: 'Button to change to the dont rotate rotation style',
        defaultMessage: 'Do not rotate'
    }
});

const DirectionPicker = props => (
    <Label
        secondary
        above={props.labelAbove}
        text=""
    >
        {/* <img
            className={styles.iconWrapperAbs}
            src={rotateIcon}
        /> */}
        <Popover
            body={
                <div className={styles.container}>
                    <img
                        draggable={false}
                        src={closeIcon}
                        className={classNames(styles.closeIcon)}
                        onClick={props.onClosePopover}
                    />
                    <Dial
                        direction={props.direction}
                        onChange={props.onChangeDirection}
                    />
                    <div className={styles.buttonRow}>
                        <button
                            className={classNames(styles.iconButton, {
                                [styles.active]: props.rotationStyle === RotationStyles.ALL_AROUND
                            })}
                            title={props.intl.formatMessage(messages.allAround)}
                            onClick={props.onClickAllAround}
                        >
                            <img
                                draggable={false}
                                src={props.rotationStyle === RotationStyles.ALL_AROUND ? selectedAround : allAroundIcon}
                            />
                        </button>
                        <button
                            className={classNames(styles.iconButton, {
                                [styles.active]: props.rotationStyle === RotationStyles.LEFT_RIGHT
                            })}
                            title={props.intl.formatMessage(messages.leftRight)}
                            onClick={props.onClickLeftRight}
                        >
                            <img
                                draggable={false}
                                src={props.rotationStyle === RotationStyles.LEFT_RIGHT ? selectedLeftRight : leftRightIcon}
                            />
                        </button>
                        <button
                            className={classNames(styles.iconButton, {
                                [styles.active]: props.rotationStyle === RotationStyles.DONT_ROTATE
                            })}
                            title={props.intl.formatMessage(messages.dontRotate)}
                            onClick={props.onClickDontRotate}
                        >
                            <img
                                draggable={false}
                                src={props.rotationStyle === RotationStyles.DONT_ROTATE ? selectedDontRotate : dontRotateIcon}
                            />
                        </button>
                    </div>
                </div>
            }
            isOpen={props.popoverOpen}
            preferPlace="above"
            onOuterAction={props.onClosePopover}
        >

            <BufferedInput
                className={classNames(
                    styles.smallInput,
                    styles.newInput
                )}
                small
                disabled={props.disabled}
                label={directionLabel}
                tabIndex="0"
                type="text"
                value={props.disabled ? '' : props.direction}
                onFocus={props.onOpenPopover}
                onSubmit={props.onChangeDirection}
            />
        </Popover>
    </Label>

);

DirectionPicker.propTypes = {
    direction: PropTypes.number,
    disabled: PropTypes.bool.isRequired,
    intl: intlShape,
    labelAbove: PropTypes.bool,
    onChangeDirection: PropTypes.func.isRequired,
    onClickAllAround: PropTypes.func.isRequired,
    onClickDontRotate: PropTypes.func.isRequired,
    onClickLeftRight: PropTypes.func.isRequired,
    onClosePopover: PropTypes.func.isRequired,
    onOpenPopover: PropTypes.func.isRequired,
    popoverOpen: PropTypes.bool.isRequired,
    rotationStyle: PropTypes.string
};

DirectionPicker.defaultProps = {
    labelAbove: false
};

const WrappedDirectionPicker = injectIntl(DirectionPicker);

export {
    WrappedDirectionPicker as default,
    RotationStyles
};
