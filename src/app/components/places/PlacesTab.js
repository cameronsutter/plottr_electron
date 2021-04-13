import React from 'react'
import PlaceListView from 'components/places/PlaceListView'
import { ErrorBoundary } from 'connected-components'

export default function PlacesTab() {
  return (
    <ErrorBoundary>
      <PlaceListView />
    </ErrorBoundary>
  )
}
