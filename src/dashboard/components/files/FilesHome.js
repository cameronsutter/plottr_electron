import React, { useState } from 'react'
import NewFiles from './NewFiles'
import RecentFiles from './RecentFiles'
import { FormControl } from 'react-bootstrap'
import t from 'format-message'
import TemplatesHome from '../templates/TemplatesHome'

export default function FilesHome (props) {
  const [showTemplates, setShowTemplates] = useState(false)

  const body = showTemplates ? <TemplatesHome smaller/> : <RecentFiles/>

  return <div className='dashboard__files'>
    <FormControl type='search' placeholder={t('Search')} className='dashboard__search' />
    <NewFiles showTemplates={setShowTemplates} templatesActive={showTemplates}/>
    { body }
  </div>
}