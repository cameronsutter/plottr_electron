import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import UnconnectedNewProjectInputModal from '../../dialogs/NewProjectInputModal'
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
  const NewProjectInputModal = UnconnectedNewProjectInputModal(connector)

  function snowflakeImportDialog(errorActions) {
    const title = t('Choose your Snowflake Pro file')
    const filters = [{ name: 'Snowflake Pro file', extensions: ['snowXML'] }]
    const properties = ['openFile']
    const files = showOpenDialogSync({ title, filters, properties })
    if (files && files[0]) {
      if (files[0].toLowerCase().includes('.snowxml')) {
        return files[0]
      } else {
        errorActions.importError('Wrong file format')
      }
    }
  }

  function scrivenerImportDialog(errorActions) {
    const title = t('Choose your Scrivener project')
    const filters = [{ name: t('Scrivener file'), extensions: ['scriv'] }]
    const properties = ['openFile', 'openDirectory']
    const files = showOpenDialogSync({ title, filters, properties })
    if (files && files[0]) {
      if (files[0].toLowerCase().includes('.scriv')) {
        return files[0]
      } else {
        errorActions.importError(t('Wrong file format'))
      }
    }
  }

  const FilesHome = ({ errorActions, importActions, isOnWeb, projectActions, isInOfflineMode }) => {
    const [view, setView] = useState('recent')

    const createFromSnowflakeImport = () => {
      if (isInOfflineMode) return

      mpq.push('btn_create_from_import', { type: 'snowflake' })
      try {
        const importedPath = snowflakeImportDialog(errorActions)
        if (importedPath && typeof importedPath == 'string') {
          createFromSnowflake(importedPath)
        } else if (importedPath && importedPath.error) {
          throw new Error(t('Wrong file format'))
        }
      } catch (error) {
        if (error) {
          log.error(error)
          dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
    }

    const createFromScrivenerImport = () => {
      if (isInOfflineMode) return

      mpq.push('btn_create_from_import', { type: 'scrivener' })
      try {
        const importedPath = scrivenerImportDialog(errorActions)
        if (importedPath && typeof importedPath == 'string') {
          createFromScrivener(importedPath)
          importActions.startScrivenerImporter()
        } else if (importedPath && importedPath.error) {
          throw new Error(importedPath.error)
        }
      } catch (error) {
        if (error) {
          log.error(error)
          dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
    }

    const handleCreateNewProject = (template) => {
      if (isInOfflineMode) return

      if (template.constructor.name == 'Object') {
        mpq.push('btn_create_with_template', { template_name: template.name })
        projectActions.startCreatingNewProject(template)
      } else {
        projectActions.startCreatingNewProject()
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
            onChooseTemplate={handleCreateNewProject}
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
        <NewProjectInputModal />
        <NewFiles
          activeView={view}
          toggleView={(val) => {
            if (!isInOfflineMode) {
              setView(val == view ? 'recent' : val)
            }
          }}
          doSnowflakeImport={createFromSnowflakeImport}
          doScrivenerImport={createFromScrivenerImport}
          isOnWeb={isOnWeb}
          doCreateNewProject={handleCreateNewProject}
          isInOfflineMode={isInOfflineMode}
        />
        {body}
      </div>
    )
  }

  FilesHome.propTypes = {
    errorActions: PropTypes.object,
    importActions: PropTypes.object,
    projectActions: PropTypes.object,
    isOnWeb: PropTypes.bool,
    isInOfflineMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  const ErrorActions = actions.error
  const AppStateActions = actions.applicationState
  const ProjectActions = actions.project

  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => ({
        isOnWeb: selectors.isOnWebSelector(state.present),
        isInOfflineMode: selectors.isInOfflineModeSelector(state.present),
      }),
      (dispatch) => {
        return {
          errorActions: bindActionCreators(ErrorActions, dispatch),
          importActions: bindActionCreators(AppStateActions, dispatch),
          projectActions: bindActionCreators(ProjectActions, dispatch),
        }
      }
    )(FilesHome)
  }

  throw new Error('Could not connect FilesHome')
}

export default FilesHomeConnector
