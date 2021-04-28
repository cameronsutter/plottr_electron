import React, { useState } from 'react'
import { t } from 'plottr_locales'
import { DashboardErrorBoundary } from 'connected-components'
import SETTINGS from '../../../common/utils/settings'
import BackupFiles from './BackupFiles'
import Folders from './Folders'

export default function BackupsHome(props) {
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
        <DashboardErrorBoundary darMode={SETTINGS.get('user.dark')}>{body}</DashboardErrorBoundary>
      </div>
    </div>
  )
}
