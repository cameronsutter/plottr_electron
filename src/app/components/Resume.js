import React from 'react'
import { PropTypes } from 'prop-types'
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
    width: '75%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    minHeight: 500,
    maxHeight: 'calc(100vh - 120px)',
  },
}

const Resume = ({ isResuming }) => {
  if (!isResuming) return null

  return (
    <PlottrModal isOpen={true} styles={(modalStyles, 'zIndex:1002')}>
      <div>We&apos;re resuming!</div>
    </PlottrModal>
  )
}

Resume.propTypes = {
  isResuming: PropTypes.bool,
}

export default connect((state) => ({
  isResuming: selectors.isResumingSelector(state.present),
}))(Resume)
