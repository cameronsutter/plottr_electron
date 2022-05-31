import { dialog } from '@electron/remote'
import { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { t } from 'plottr_locales'
import { selectors, actions } from 'pltr/v2'

const Error = ({ errorMessage, clearError }) => {
  useEffect(() => {
    if (errorMessage) {
      dialog.showErrorBox(t('Error'), errorMessage)
      clearError()
    }
  }, [errorMessage, clearError])

  return null
}

Error.propTypes = {
  errorMessage: PropTypes.string,
  clearError: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    errorMessage: selectors.errorMessageSelector(state.present),
  }),
  {
    clearError: actions.error.clearError,
  }
)(Error)
