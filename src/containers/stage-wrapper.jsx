import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {STAGE_DISPLAY_SIZES, STAGE_SIZE_MODES} from '../lib/layout-constants.js';
import StageWrapperComponent from '../components/stage-wrapper/stage-wrapper.jsx';

const StageWrapper = props => <StageWrapperComponent {...props} />;

StageWrapper.propTypes = {
    isRendererSupported: PropTypes.bool.isRequired,
    stageSize: PropTypes.oneOf(Object.keys(STAGE_DISPLAY_SIZES)).isRequired,
    stageMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)).isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default StageWrapper;
