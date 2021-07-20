import React, { useState } from 'react'
import { t } from 'plottr_locales'
import DashboardErrorBoundary from '../../containers/DashboardErrorBoundary'
import UnconnectedBackupFiles from './BackupFiles'
import UnconnectedFolders from './Folders'

const BackupsHomeConnector = (connector) => {
  const {
    platform: { settings },
  } = connector

  const BackupFiles = UnconnectedBackupFiles(connector)
  const Folders = UnconnectedFolders(connector)

  const BackupsHome = (props) => {
    const [selectedFolder, selectFolder] = useState(null)

    let body = null
    if (selectedFolder) {
      body = <BackupFiles folder={selectedFolder} />
    } else {
      body = <Folders selectFolder={selectFolder} />
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
        {breadcrumb}
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
