import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import CharacterListView from 'components/characters/characterListView'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default class CharactersTab extends Component {
  render () {
    return <ErrorBoundary>
      <CharacterListView />
    </ErrorBoundary>
  }

  static propTypes = {}
}
