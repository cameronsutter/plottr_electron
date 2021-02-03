import React, { Component } from 'react'
import TagListView from 'components/tag/tagListView'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default class TagsTab extends Component {
  render() {
    return (
      <ErrorBoundary>
        <TagListView />
      </ErrorBoundary>
    )
  }
}
