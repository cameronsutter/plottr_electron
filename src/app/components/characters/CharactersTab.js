import React from 'react'
import CharacterListView from 'components/characters/CharacterListView'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default function CharactersTab() {
  return (
    <ErrorBoundary>
      <CharacterListView />
    </ErrorBoundary>
  )
}
