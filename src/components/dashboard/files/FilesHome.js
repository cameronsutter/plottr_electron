import React, { useState, useCallback } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import InputModal from '../../dialogs/InputModal'
import UnconnectedNewFiles from './NewFiles'
import UnconnectedRecentFiles from './RecentFiles'
import UnconnectedTemplatePicker from '../../templates/TemplatePicker'

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

  const FilesHome = ({ errorActions, importActions, isOnWeb }) => {
    const [view, setView] = useState('recent')
    const [namingFile, setNamingFile] = useState(null)
    const [template, setTemplate] = useState(null)

    const createWithTemplate = (template, name) => {
      mpq.push('btn_create_with_template')
      try {
        createNew(template, name)
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

    const startNamingTemplate = useCallback(
      (template) => {
        setNamingFile('template')
        setTemplate(template)
      },
      [setNamingFile]
    )

    let body = null
    switch (view) {
      case 'templates':
        body = (
          <TemplatePicker
            newProject
            modal={false}
            types={['custom', 'project', 'plotlines']}
            onChooseTemplate={startNamingTemplate}
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

    const handleNameInput = useCallback(
      (value) => {
        setNamingFile(null)
        if (template) {
          createWithTemplate(template, value)
        } else {
          createNew(template, value)
        }
        setTemplate(null)
      },
      [setNamingFile, setTemplate, template, namingFile]
    )
    const cancelNameInput = useCallback(() => {
      setNamingFile(null)
      setTemplate(null)
    }, [setNamingFile, setTemplate])

    const NameFile = () => {
      if (!namingFile) return null

      return (
        <InputModal
          title={t('Name')}
          getValue={handleNameInput}
          cancel={cancelNameInput}
          isOpen={true}
          type="text"
        />
      )
    }

    return (
      <div className="dashboard__files">
        <NameFile />
        <NewFiles
          activeView={view}
          toggleView={(val) => setView(val == view ? 'recent' : val)}
          doSnowflakeImport={createFromSnowflakeImport}
          doScrivenerImport={createFromScrivenerImport}
          isOnWeb={isOnWeb}
        />
        {body}
      </div>
    )
  }

  FilesHome.propTypes = {
    errorActions: PropTypes.func,
    importActions: PropTypes.func,
    isOnWeb: PropTypes.bool,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  const ErrorActions = actions.error
  const AppStateActions = actions.applicationState

  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => ({
        isOnWeb: selectors.isOnWebSelector(state.present),
      }),
      (dispatch) => {
        return {
          errorActions: bindActionCreators(ErrorActions, dispatch),
          importActions: bindActionCreators(AppStateActions, dispatch),
        }
      }
    )(FilesHome)
  }

  throw new Error('Could not connect FilesHome')
}

export default FilesHomeConnector
