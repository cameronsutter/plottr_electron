import React, { useState } from 'react'
import { t } from 'plottr_locales'
import { Col, Grid, Row, FormControl } from 'react-bootstrap'
import UnconnectedDashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import UnconnectedBackupFiles from './BackupFiles'
import UnconnectedFolders from './Folders'

const BackupsHomeConnector = (connector) => {
  const {
    platform: { settings, useBackupFolders },
  } = connector

  const BackupFiles = UnconnectedBackupFiles(connector)
  const Folders = UnconnectedFolders(connector)
  const DashboardErrorBoundary = UnconnectedDashboardErrorBoundary(connector)

  const BackupsHome = (props) => {
    const [selectedFolder, selectFolder] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const folders = useBackupFolders(searchTerm)

    let body = null
    if (selectedFolder) {
      body = <BackupFiles folder={selectedFolder} searchTerm={searchTerm} />
    } else {
      body = <Folders selectFolder={selectFolder} folders={folders} searchTerm={searchTerm} />
    }

    let breadcrumb = null
    if (selectedFolder) {
      const dateStr = t('{date, date, medium}', {
        date: new Date(selectedFolder.date.replace(/_/g, '-')),
      })
      breadcrumb = (
        <div className="dashboard__breadcrumb">
          <a href="#" onClick={() => selectFolder(null)}>
            {t('All')}
          </a>
          <span> » </span>
          <span>{dateStr}</span>
        </div>
      )
    }

    // <FormControl type='search' placeholder={t('Search')} className='dashboard__search' />
    return (
      <div className="dashboard__backups">
        <h1>{t('Your Backups')}</h1>
        <Grid fluid>
          <Row>
            <Col xs={4} sm={6} md={8} lg={9}>
              {breadcrumb}
            </Col>
            <Col xs={8} sm={6} md={4} lg={3}>
              <FormControl
                type="search"
                placeholder={t('Search')}
                className="dashboard__search"
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </Col>
          </Row>
        </Grid>
        <div className="dashboard__backups__wrapper">
          <DashboardErrorBoundary darMode={settings.get('user.dark')}>
            {body}
          </DashboardErrorBoundary>
        </div>
      </div>
    )
  }

  return BackupsHome
}

export default BackupsHomeConnector
