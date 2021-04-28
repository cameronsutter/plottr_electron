import React from 'react'
import { ErrorBoundary, TimelineWrapper } from 'connected-components'

const TimelineTab = () => {
  return (
    <ErrorBoundary>
      <TimelineWrapper />
    </ErrorBoundary>
  )
}

export default React.memo(TimelineTab)
