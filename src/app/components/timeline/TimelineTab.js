import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import ErrorBoundary from '../../containers/ErrorBoundary'
import TimelineWrapper from './TimelineWrapper'

const TimelineTab = () => {
  return (
    <ErrorBoundary>
      <TimelineWrapper />
    </ErrorBoundary>
  )
}

export default React.memo(TimelineTab)
