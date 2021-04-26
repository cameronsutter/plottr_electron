import React from 'react'
import { ErrorBoundary, TagListView } from 'connected-components'

export default function TagsTab() {
  return (
    <ErrorBoundary>
      <TagListView />
    </ErrorBoundary>
  )
}
