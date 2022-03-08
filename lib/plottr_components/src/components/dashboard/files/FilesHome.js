import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
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

  function snowflakeImportDialog(errorActions) {
    const title = t('Choose your Snowflake Pro file')
    const filters = [{ name: 'Snowflake Pro file', extensions: ['snowXML'] }]
    const properties = ['openFile']
    const files = showOpenDialogSync({ title, filters, properties })
    if (files && files.length) {
      const importedPath = files[0]
      if (importedPath.toLowerCase().includes('.snowxml')) {
        return importedPath
      } else {
        return errorActions.importError('Wrong file format')
      }
    }
  }

  function scrivenerImportDialog(errorActions) {
    const title = t('Choose your Scrivener project')
    const filters = [{ name: t('Scrivener file'), extensions: ['scriv'] }]
    const properties = ['openFile', 'createDirectory', 'openDirectory']
    const files = showOpenDialogSync({ title, filters, properties })
    if (files && files.length) {
      const importedPath = files[0]
      if (importedPath.toLowerCase().includes('.scriv')) {
        return importedPath
      } else {
        return errorActions.importError('Wrong file format')
      }
    }
  }

  const FilesHome = ({ errorActions, importActions }) => {
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
        const importedPath = snowflakeImportDialog(errorActions)
        if (importedPath) {
          createFromSnowflake(importedPath)
        }
      } catch (error) {
        log.error(error)
        dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
      }
    }

    const createFromScrivenerImport = () => {
      mpq.push('btn_create_from_import', { type: 'scrivener' })
      try {
        const importedPath = scrivenerImportDialog(errorActions)
        if (importedPath) {
          createFromScrivener(importedPath)
          importActions.startScrivenerImporter()
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

  FilesHome.propTypes = {
    errorActions: PropTypes.func,
    importActions: PropTypes.func,
  }

  const {
    redux,
    pltr: { actions },
  } = connector

  const ErrorActions = actions.beat
  const AppStateActions = actions.applicationState

  checkDependencies({ redux, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(null, (dispatch) => {
      return {
        errorActions: bindActionCreators(ErrorActions, dispatch),
        importActions: bindActionCreators(AppStateActions, dispatch),
      }
    })(FilesHome)
  }

  throw new Error('Could not connect FilesHome')
}

export default FilesHomeConnector
