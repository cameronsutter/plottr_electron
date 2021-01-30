import React, { Component } from 'react'
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
