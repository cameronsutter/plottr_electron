import React from 'react'
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
