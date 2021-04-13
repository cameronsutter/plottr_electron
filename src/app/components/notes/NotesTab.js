import React from 'react'
import NoteListView from 'components/notes/noteListView'
import { ErrorBoundary } from 'connected-components'

export default function NotesTab() {
  return (
    <ErrorBoundary>
      <NoteListView />
    </ErrorBoundary>
  )
}
