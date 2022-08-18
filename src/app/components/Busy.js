import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from 'pltr/v2'

const Busy = ({ applicationIsBusyAndCannotBeQuit }) => {
  return applicationIsBusyAndCannotBeQuit ? (
    <img width="50" src="../icons/logo_28_500.png" className="busy" />
  ) : null
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
