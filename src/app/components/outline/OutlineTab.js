import React from 'react'
import { ErrorBoundary } from 'connected-components'
import OutlineView from './OutlineView'

export default function OutlineTab() {
  return (
    <ErrorBoundary>
      <OutlineView />
    </ErrorBoundary>
  )
}
