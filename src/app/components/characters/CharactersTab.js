import React from 'react'
import { CharacterListView } from 'connected-components'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default function CharactersTab() {
  return (
    <ErrorBoundary>
      <CharacterListView />
    </ErrorBoundary>
  )
}
