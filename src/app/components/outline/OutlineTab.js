import React from 'react'
import ErrorBoundary from '../../containers/ErrorBoundary'
import OutlineView from './OutlineView'

export default function OutlineTab() {
  return (
    <ErrorBoundary>
      <OutlineView />
    </ErrorBoundary>
  )
}
