import React, { useState } from 'react'
import UnconnectedNewFiles from './NewFiles'
import UnconnectedRecentFiles from './RecentFiles'
import UnconnectedTemplatePicker from '../../templates/TemplatePicker'
import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const FilesHomeConnector = (connector) => {
  const {
    platform: {
      file: { createNew, createFromSnowflake, createFromScrivener },
      log,
      dialog,
      showOpenDialogSync,
      mpq,
    },
  } = connector
  checkDependencies({
    createNew,
    createFromSnowflake,
    createFromScrivener,
    log,
    dialog,
    showOpenDialogSync,
    mpq,
  })

  const NewFiles = UnconnectedNewFiles(connector)
  const RecentFiles = UnconnectedRecentFiles(connector)
  const TemplatePicker = UnconnectedTemplatePicker(connector)

  function snowflakeImportDialog() {
    const title = t('Choose your Snowflake Pro file')
    const filters = [{ name: 'Snowflake Pro file', extensions: ['snowXML'] }]
    const properties = ['openFile']
    const files = showOpenDialogSync({ title, filters, properties })
    if (files && files.length) {
      const importedPath = files[0]
      if (importedPath.toLowerCase().includes('.snowxml')) {
        return importedPath
      } else {
        return null
      }
    }
  }

  function scrivenerImportDialog() {
    const title = t('Choose your Scrivener project')
    const filters = [{ name: t('Scrivener file'), extensions: ['scriv'] }]
    const properties = ['openFile', 'createDirectory']
    const files = showOpenDialogSync({ title, filters, properties })
    if (files && files.length) {
      const importedPath = files[0]
      if (importedPath.toLowerCase().includes('.scriv')) {
        return importedPath
      } else {
        return null
      }
    }
  }

  const FilesHome = (props) => {
    const [view, setView] = useState('recent')

    const createWithTemplate = (template) => {
      mpq.push('btn_create_with_template')
      try {
        createNew(template)
      } catch (error) {
        log.error(error)
        dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
      }
    }

    const createFromSnowflakeImport = () => {
      mpq.push('btn_create_from_import', { type: 'snowflake' })
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

    const createFromScrivenerImport = () => {
      mpq.push('btn_create_from_import', { type: 'snowflake' })
      try {
        const importedPath = scrivenerImportDialog()
        if (importedPath) {
          createFromScrivener(importedPath)
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
            types={['custom', 'project', 'plotlines']}
            onChooseTemplate={createWithTemplate}
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
          doSnowflakeImport={createFromSnowflakeImport}
          doScrivenerImport={createFromScrivenerImport}
        />
        {body}
      </div>
    )
  }

  return FilesHome
}

export default FilesHomeConnector
