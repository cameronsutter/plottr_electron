import React, { Component } from 'react'
import CharacterListView from 'components/characters/CharacterListView'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default class CharactersTab extends Component {
  render() {
    return (
      <ErrorBoundary>
        <CharacterListView />
      </ErrorBoundary>
    )
  }

  static propTypes = {}
}
