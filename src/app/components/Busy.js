import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from 'pltr/v2'

const Busy = ({ applicationIsBusyAndCannotBeQuit }) => {
  // We've decided to disable this component until further notice.
  return null
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
