import React from 'react'
import { NoteListView, ErrorBoundary } from 'connected-components'

export default function NotesTab() {
  return (
    <ErrorBoundary>
      <NoteListView />
    </ErrorBoundary>
  )
}
