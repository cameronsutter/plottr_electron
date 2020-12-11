import React, { useState } from 'react'
import { FormControl } from 'react-bootstrap'
import t from 'format-message'
import ErrorBoundary from '../../../app/containers/ErrorBoundary'
import BackupFiles from './BackupFiles'
import Folders from './Folders'

export default function BackupsHome (props) {
  const [selectedFolder, selectFolder] = useState(null)

  let body = null
  if (selectedFolder) {
    body = <BackupFiles folder={selectedFolder} />
  } else {
    body = <Folders selectFolder={selectFolder}/>
  }

  let breadcrumb = null
  if (selectedFolder) {
    const dateStr = t('{date, date, medium}', {date: new Date(selectedFolder.date.replace(/_/g, '-'))})
    breadcrumb = <div className='dashboard__breadcrumb'>
      <a href='#' onClick={() => selectFolder(null)}>{t('All')}</a><span> » </span><span>{dateStr}</span>
    </div>
  }

  // <FormControl type='search' placeholder={t('Search')} className='dashboard__search' />
  return <div className='dashboard__backups'>
    <h1>{t('Your Backups')}</h1>
    { breadcrumb }
    <div className='dashboard__backups__wrapper'>
      <ErrorBoundary>
        { body }
      </ErrorBoundary>
    </div>
  </div>
}
