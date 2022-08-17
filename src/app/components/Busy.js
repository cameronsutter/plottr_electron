import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from 'pltr/v2'

import { PlottrModal } from 'connected-components'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '20%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    minHeight: 150,
    maxHeight: 150,
  },
}

const Busy = ({ applicationIsBusyAndCannotBeQuit }) => {
  return (
    <PlottrModal isOpen={applicationIsBusyAndCannotBeQuit} style={modalStyles}>
      <div>HI THERE! I am busy! :D</div>
    </PlottrModal>
  )
}

Busy.propTypes = {
  applicationIsBusyAndCannotBeQuit: PropTypes.bool,
}

export default connect((state) => {
  return {
    applicationIsBusyAndCannotBeQuit: selectors.busyWithWorkThatPreventsQuittingSelector(
      state.present
    ),
  }
})(Busy)
