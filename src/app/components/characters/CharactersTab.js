import React from 'react'
import { CharacterListView, ErrorBoundary } from 'connected-components'

export default function CharactersTab() {
  return (
    <ErrorBoundary>
      <CharacterListView />
    </ErrorBoundary>
  )
}
