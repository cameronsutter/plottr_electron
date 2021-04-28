import React from 'react'
import { ErrorBoundary, PlaceListView } from 'connected-components'

export default function PlacesTab() {
  return (
    <ErrorBoundary>
      <PlaceListView />
    </ErrorBoundary>
  )
}
