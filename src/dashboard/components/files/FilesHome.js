import React, { useState } from 'react'
import NewFiles from './NewFiles'
import RecentFiles from './RecentFiles'
import { FormControl } from 'react-bootstrap'
import t from 'format-message'
import TemplatePicker from '../templates/TemplatePicker'
import { createNew } from '../../utils/window_manager'

export default function FilesHome (props) {
  const [view, setView] = useState('recent')

  const createWithTemplate = template => {
    try {
      createNew(template.templateData)
    } catch (error) {
      // TODO: tell the user something went wrong
      console.error(error)
    }
  }

  let body = null
  switch (view) {
    case 'templates':
      body = <TemplatePicker startNew={createWithTemplate}/>
      break
    case 'import':
      body = null
      break
    default:
      body = <RecentFiles/>
      break
  }

  return <div className='dashboard__files'>
    <FormControl type='search' placeholder={t('Search')} className='dashboard__search' />
    <NewFiles activeView={view} toggleView={val => setView(val == view ? 'recent' : val)}/>
    { body }
  </div>
}