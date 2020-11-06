import React from 'react'
import NewFiles from './NewFiles'
import RecentFiles from './RecentFiles'
import { FormControl } from 'react-bootstrap'
import t from 'format-message'

export default function FilesHome (props) {
  return <div className='dashboard__files'>
    <FormControl type='search' placeholder={t('Search')} className='dashboard__search' />
    <NewFiles/>
    <RecentFiles/>
  </div>
}