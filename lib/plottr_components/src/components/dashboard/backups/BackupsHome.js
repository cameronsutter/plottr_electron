import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { t } from 'plottr_locales'
import { Col, Grid, Row, FormControl } from 'react-bootstrap'
import UnconnectedDashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import UnconnectedBackupFiles from './BackupFiles'
import UnconnectedFolders from './Folders'
import { checkDependencies } from '../../checkDependencies'

const BackupsHomeConnector = (connector) => {
  const {
    platform: { settings, useBackupFolders },
  } = connector
  checkDependencies({ settings, useBackupFolders })

  const BackupFiles = UnconnectedBackupFiles(connector)
  const Folders = UnconnectedFolders(connector)
  const DashboardErrorBoundary = UnconnectedDashboardErrorBoundary(connector)

  const BackupsHome = ({ userId }) => {
    const [selectedFolder, selectFolder] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const folders = useBackupFolders(userId, searchTerm)

    let body = null
    if (selectedFolder) {
      body = <BackupFiles folder={selectedFolder} searchTerm={searchTerm} />
    } else {
      body = <Folders selectFolder={selectFolder} folders={folders} searchTerm={searchTerm} />
    }

    let breadcrumb = null
    if (selectedFolder) {
      const date = selectedFolder.date
      const dateStr = t('{date, date, medium}', {
        date: date instanceof Date ? date : new Date(date.replace(/_/g, '-')),
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

  BackupsHome.propTypes = {
    userId: PropTypes.string.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      userId: selectors.userIdSelector(state.present),
    }))(BackupsHome)
  }

  throw new Error('Could not connect BackupsHome')
}

export default BackupsHomeConnector
