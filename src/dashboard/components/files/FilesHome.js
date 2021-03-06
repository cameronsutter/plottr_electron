import React, { useState } from 'react'
import { remote } from 'electron'
import NewFiles from './NewFiles'
import RecentFiles from './RecentFiles'
import { t } from 'plottr_locales'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import { createNew, createFromSnowflake } from '../../utils/window_manager'
import MPQ from '../../../common/utils/MPQ'
import log from 'electron-log'
const { dialog } = remote
const win = remote.getCurrentWindow()

export default function FilesHome(props) {
  const [view, setView] = useState('recent')

  const createWithTemplate = (template) => {
    MPQ.push('btn_create_with_template')
    try {
      createNew(template)
    } catch (error) {
      log.error(error)
      dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
    }
  }

  const createFomImport = () => {
    MPQ.push('btn_create_from_import', { type: 'snowflake' })
    try {
      const importedPath = snowflakeImportDialog()
      if (importedPath) {
        createFromSnowflake(importedPath)
      }
    } catch (error) {
      log.error(error)
      dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
    }
  }

  let body = null
  switch (view) {
    case 'templates':
      body = (
        <TemplatePicker
          newProject
          modal={false}
          type={['custom', 'project', 'plotlines']}
          onChooseTemplate={createWithTemplate}
          showTemplateSaveButton={false}
          showCancelButton={false}
          confirmButtonText={t('Create New Project')}
        />
      )
      break
    case 'import':
      body = null
      break
    default:
      body = <RecentFiles />
      break
  }

  return (
    <div className="dashboard__files">
      <NewFiles
        activeView={view}
        toggleView={(val) => setView(val == view ? 'recent' : val)}
        doImport={createFomImport}
      />
      {body}
    </div>
  )
}

function snowflakeImportDialog() {
  const title = t('Choose your Snowflake Pro file')
  const filters = [{ name: 'Snowflake Pro file', extensions: ['snowXML'] }]
  const properties = ['openFile']
  const files = dialog.showOpenDialogSync(win, { title, filters, properties })
  if (files && files.length) {
    const importedPath = files[0]
    if (importedPath.toLowerCase().includes('.snowxml')) {
      return importedPath
    } else {
      return null
    }
  }
}
