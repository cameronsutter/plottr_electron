import React from 'react'
import { ErrorBoundary, OutlineView } from 'connected-components'

export default function OutlineTab() {
  return (
    <ErrorBoundary>
      <OutlineView />
    </ErrorBoundary>
  )
}
