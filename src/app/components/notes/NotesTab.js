import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import NoteListView from 'components/notes/noteListView'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default class NotesTab extends Component {
  render() {
    return (
      <ErrorBoundary>
        <NoteListView />
      </ErrorBoundary>
    )
  }
}
