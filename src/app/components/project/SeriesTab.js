import React from 'react'
import {
  Nav,
  EditSeries,
  ErrorBoundary,
  BookList,
  FileLocation,
  SubNav,
} from 'connected-components'

export default function SeriesTab() {
  const SubNavigation = () => {
    return (
      <SubNav>
        <Nav bsStyle="pills">
          <FileLocation />
        </Nav>
      </SubNav>
    )
  }

  return (
    <ErrorBoundary>
      <div className="series__container container-with-sub-nav">
        <SubNavigation />
        <div className="tab-body">
          <EditSeries />
          <BookList />
        </div>
      </div>
    </ErrorBoundary>
  )
}
