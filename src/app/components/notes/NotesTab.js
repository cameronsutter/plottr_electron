import React from 'react'
import NoteListView from 'components/notes/noteListView'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default function NotesTab() {
  return (
    <ErrorBoundary>
      <NoteListView />
    </ErrorBoundary>
  )
}
