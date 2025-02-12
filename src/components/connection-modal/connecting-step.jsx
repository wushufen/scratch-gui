import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import Box from '../box/box.jsx';
import Dots from './dots.jsx';

import bluetoothIcon from './icons/bluetooth-white.svg';
import closeIcon from '../close-button/icon--close.svg';

import styles from './connection-modal.css';

const ConnectingStep = props => (
    <Box className={styles.body}>
        <Box className={styles.activityArea}>
            <div className={styles['peripheral-tile-item']}>
                <div
                    className={classNames([styles['peripheral-tile-status']])}
                >
                    正在连接
                </div>
            </div>

            <Box
                hidden
                className={styles.centeredRow}
            >
                <div className={styles.peripheralActivity}>
                    <img
                        className={styles.peripheralActivityIcon}
                        src={props.connectionIconURL}
                    />
                    <img
                        className={styles.bluetoothConnectingIcon}
                        src={bluetoothIcon}
                    />
                </div>
            </Box>
        </Box>
        <Box className={styles.bottomArea}>
            <Box
                hidden
                className={classNames(styles.bottomAreaItem, styles.instructions)}
            >
                {props.connectingMessage}
            </Box>
            <Dots
                className={styles.bottomAreaItem}
                counter={1}
                total={3}
            />
            <div className={classNames(styles.bottomAreaItem, styles.segmentedButton)}>
                <button
                    disabled
                    className={styles.connectionButton}
                >
                    <FormattedMessage
                        defaultMessage="Connecting..."
                        description="Label indicating that connection is in progress"
                        id="gui.connection.connecting-cancelbutton"
                    />
                </button>
                <button
                    className={styles.connectionButton}
                    onClick={props.onDisconnect}
                >
                    <img
                        className={styles.abortConnectingIcon}
                        src={closeIcon}
                    />
                </button>
            </div>
        </Box>
    </Box>
);

ConnectingStep.propTypes = {
    connectingMessage: PropTypes.node.isRequired,
    connectionIconURL: PropTypes.string.isRequired,
    onDisconnect: PropTypes.func
};

export default ConnectingStep;
