import React from 'react'
import TagListView from 'components/tag/tagListView'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default function TagsTab() {
  return (
    <ErrorBoundary>
      <TagListView />
    </ErrorBoundary>
  )
}
