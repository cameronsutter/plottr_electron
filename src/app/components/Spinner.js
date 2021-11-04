import React from 'react'

import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'

import { selectors } from 'pltr/v2'
import { FullPageSpinner as Spinner } from 'connected-components'

const FullPageSpinner = ({ isLoading }) => {
  if (!isLoading) return null

  return <Spinner />
}

FullPageSpinner.propTypes = {
  isLoading: PropTypes.bool,
}

export default connect((state) => ({
  isLoading: selectors.loadingFileSelector(state.present),
}))(FullPageSpinner)
