import React from 'react'
import { ErrorBoundary } from 'connected-components'
import TimelineWrapper from './TimelineWrapper'

const TimelineTab = () => {
  return (
    <ErrorBoundary>
      <TimelineWrapper />
    </ErrorBoundary>
  )
}

export default React.memo(TimelineTab)
