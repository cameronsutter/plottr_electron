import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import Grid from '../../Grid'
import Col from '../../Col'
import Row from '../../Row'
import FormControl from '../../FormControl'
import UnconnectedDashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import UnconnectedBackupFiles from './BackupFiles'
import UnconnectedFolders from './Folders'

const BackupsHomeConnector = (connector) => {
  const BackupFiles = UnconnectedBackupFiles(connector)
  const Folders = UnconnectedFolders(connector)
  const DashboardErrorBoundary = UnconnectedDashboardErrorBoundary(connector)

  const BackupsHome = ({ userId, computeFolders }) => {
    const [selectedFolder, selectFolder] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [folders, setFolders] = useState([])

    useEffect(() => {
      setFolders(computeFolders(searchTerm, selectedFolder))
    }, [searchTerm, selectedFolder, setFolders, computeFolders])

    useEffect(() => {
      setSearchTerm('')
    }, [selectedFolder])

    // NOTE: It's important to render the dashboard body wrapper here
    // to make sure that scrolling resets when changing folders etc.
    const Body = () => (
      <div className="dashboard__backups__wrapper">
        <DashboardErrorBoundary>
          {selectedFolder ? (
            <BackupFiles folder={selectedFolder} searchTerm={searchTerm} />
          ) : (
            <Folders selectFolder={selectFolder} folders={folders} searchTerm={searchTerm} />
          )}
        </DashboardErrorBoundary>
      </div>
    )

    let breadcrumb = null
    if (selectedFolder) {
      const date = selectedFolder.date
      const dateStr = t('{date, date, medium}', {
        date: date instanceof Date ? date : helpers.date.parseStringDate(date),
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
          </Row>
          <Row>
            <Col xs={8} sm={6} md={4} lg={3}>
              <FormControl
                type="search"
                placeholder={t('Search')}
                className="dashboard__search"
                onChange={(event) => setSearchTerm(event.target.value)}
                value={searchTerm}
              />
            </Col>
          </Row>
        </Grid>
        <Body />
      </div>
    )
  }

  BackupsHome.propTypes = {
    userId: PropTypes.string,
    computeFolders: PropTypes.func.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      userId: selectors.userIdSelector(state.present),
      computeFolders: (searchTerm, selectedFolder) =>
        selectors.filteredSortedBackupsSelector(state.present, searchTerm, !selectedFolder),
    }))(BackupsHome)
  }

  throw new Error('Could not connect BackupsHome')
}

export default BackupsHomeConnector
