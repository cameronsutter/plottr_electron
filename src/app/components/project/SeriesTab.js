import React from 'react'
import { t as i18n } from 'plottr_locales'
import { EditSeries, ErrorBoundary, BookList, FileLocation, SubNav } from 'connected-components'
import { Nav, NavItem, Button } from 'react-bootstrap'
import { ipcRenderer } from 'electron'

export default function SeriesTab() {
  const openDashboard = () => {
    ipcRenderer.send('pls-open-dashboard')
  }

  const SubNavigation = () => {
    return (
      <SubNav>
        <Nav bsStyle="pills">
          <NavItem>
            <Button bsSize="small" onClick={openDashboard}>
              {i18n('Open Dashboard')}
            </Button>
          </NavItem>
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
