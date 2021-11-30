import React, { useState, useEffect, useRef } from 'react'
import { ipcRenderer, remote } from 'electron'
import log from 'electron-log'
import { connect } from 'react-redux'
import PropTypes from 'react-proptypes'

import { listenToFiles } from 'wired-up-firebase'
import { actions } from 'pltr/v2'
import { t } from 'plottr_locales'

import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import ActsTour from '../components/intros/Tour'
import Spinner from '../components/Spinner'
import {
  AskToSaveModal,
  TemplateCreate,
  ErrorBoundary,
  ExportDialog,
  ActsHelpModal,
} from 'connected-components'
import { hasPreviousAction } from '../../common/utils/error_reporter'
import { store } from '../store'
import { focusIsEditable } from '../../common/utils/undo'
import { selectors } from 'pltr/v2'
import { listenToCustomTemplates } from '../../dashboard/utils/templates_from_firestore'

const { dialog } = remote

const App = ({
  forceProjectDashboard,
  showTour,
  userId,
  isCloudFile,
  setFileList,
  setOffline,
  isOffline,
  fileId,
  clientId,
  setPermission,
  isResuming,
}) => {
  const [showTemplateCreate, setShowTemplateCreate] = useState(false)
  const [type, setType] = useState(null)
  const [showAskToSave, setShowAskToSave] = useState(false)
  const [blockClosing, setBlockClosing] = useState(true)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showActsGuideHelp, setShowActsGuideHelp] = useState(false)
  const [checkedUser, setCheckedUser] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(isCloudFile && !userId)

  const isTryingToReload = useRef(false)
  const isTryingToClose = useRef(false)

  const closeOrRefresh = (shouldClose) => {
    if (isTryingToReload.current) {
      location.reload()
    } else {
      if (shouldClose) window.close()
    }
  }

  const askToSave = (event) => {
    if (!blockClosing) return
    if (process.env.NODE_ENV == 'development') {
      closeOrRefresh(isTryingToClose.current)
      return
    }

    if (focusIsEditable()) {
      // TODO: make this work to save people from closing when they are still editing something
      // event.returnValue = 'nope'
      // alert(i18n('Save the work in the open text editor before closing'))
    }
    // No actions yet? doesn't need to save
    //
    // Cloud files are saved as we go.
    if (!hasPreviousAction() || isCloudFile) {
      setBlockClosing(false)
      closeOrRefresh(isTryingToClose.current)
      return
    }

    event.returnValue = 'nope'
    setShowAskToSave(true)
  }

  useEffect(() => {
    setOffline(!window.navigator.onLine)
    const onlineListener = window.addEventListener('online', () => {
      setOffline(false)
    })
    const offlineListener = window.addEventListener('offline', () => {
      setOffline(true)
    })
    return () => {
      window.removeEventListener('online', onlineListener)
      window.removeEventListener('offline', offlineListener)
    }
  }, [setOffline, fileId, clientId])

  useEffect(() => {
    setNeedsLogin(isCloudFile && !userId)
    if (!isResuming && !userId && isCloudFile && checkedUser && !isOffline) {
      log.error('Attempting to open a cloud file locally without being logged in.')
      dialog.showErrorBox(t('Error'), t('This appears to be a Plottr Pro file.  Please log in.'))
    }
  }, [userId, isCloudFile, checkedUser, isOffline])

  useEffect(() => {
    if (checkedUser && userId) {
      const fileListener = listenToFiles(userId, (files) => {
        const activeFiles = files.filter(({ deleted }) => !deleted)
        setFileList(activeFiles)
      })
      return () => fileListener()
    }
    return () => {}
  }, [checkedUser, userId])

  useEffect(() => {
    ipcRenderer.on('save-as-template-start', (event, type) => {
      setType(type)
      setShowTemplateCreate(true)
    })
    ipcRenderer.on('reload', () => {
      isTryingToReload.current = true
      askToSave({})
    })
    ipcRenderer.on('wants-to-close', () => {
      log.info('received wants-to-close')
      isTryingToClose.current = true
      askToSave({})
    })
    ipcRenderer.on('advanced-export-file-from-menu', (event) => {
      setShowExportDialog(true)
    })
    ipcRenderer.on('turn-on-acts-help', () => {
      setShowActsGuideHelp(true)
    })
    window.addEventListener('beforeunload', askToSave)

    return () => {
      ipcRenderer.removeAllListeners('save-as-template-start')
      ipcRenderer.removeAllListeners('reload')
      ipcRenderer.removeAllListeners('wants-to-close')
      ipcRenderer.removeAllListeners('advanced-export-file-from-menu')
      ipcRenderer.removeAllListeners('turn-on-acts-help')
      window.removeEventListener('beforeunload', askToSave)
    }
  }, [])

  useEffect(() => {
    if (userId && !isOffline) {
      return listenToCustomTemplates(userId)
    }
    return () => {}
  }, [userId, isOffline])

  const dontSaveAndClose = () => {
    setBlockClosing(false)
    setShowAskToSave(false)
    closeOrRefresh(true)
  }

  const saveAndClose = () => {
    setBlockClosing(false)
    setShowAskToSave(false)
    const { present } = store.getState()
    ipcRenderer.send('save-file', present.file.fileName, present)
    closeOrRefresh(true)
  }

  const renderTemplateCreate = () => {
    if (!showTemplateCreate) return null

    return <TemplateCreate type={type} close={() => setShowTemplateCreate(false)} />
  }

  const renderAskToSave = () => {
    if (!showAskToSave || !isCloudFile) return null

    return (
      <AskToSaveModal
        dontSave={dontSaveAndClose}
        save={saveAndClose}
        cancel={() => setShowAskToSave(false)}
      />
    )
  }

  const renderGuidedTour = () => {
    let feature = store.getState().present.tour.feature.name
    if (!feature) return null
    if (
      store.getState().present.featureFlags.BEAT_HIERARCHY && //in the future can include a switch(feature) which if case('acts') -> tourConditions = true --- if tourConditions true then the tour will run
      feature
    )
      return <ActsTour />
    return null
  }

  const renderAdvanceExportModal = () => {
    if (!showExportDialog) return null
    return <ExportDialog close={() => setShowExportDialog(false)} />
  }

  const renderActStructureHelpModal = () => {
    if (!showActsGuideHelp) return null
    return <ActsHelpModal close={() => setShowActsGuideHelp(false)} />
  }

  return (
    <ErrorBoundary>
      <ErrorBoundary>
        <React.StrictMode>
          <Navigation
            forceProjectDashboard={forceProjectDashboard}
            needsLogin={needsLogin}
            checkedUser={(newVal) => setCheckedUser(newVal)}
          />
        </React.StrictMode>
      </ErrorBoundary>
      <main className="project-main tour-end">
        <React.StrictMode>
          <Body />
        </React.StrictMode>
      </main>
      <React.StrictMode>
        <Spinner />
        {renderTemplateCreate()}
        {renderAskToSave()}
        {showTour && renderGuidedTour()}
        {renderAdvanceExportModal()}
        {renderActStructureHelpModal()}
      </React.StrictMode>
    </ErrorBoundary>
  )
}

App.propTypes = {
  userId: PropTypes.string,
  showTour: PropTypes.bool,
  forceProjectDashboard: PropTypes.bool,
  isCloudFile: PropTypes.bool,
  setFileList: PropTypes.func.isRequired,
  setOffline: PropTypes.func.isRequired,
  isOffline: PropTypes.bool,
  fileId: PropTypes.string,
  clientId: PropTypes.string,
  setPermission: PropTypes.func.isRequired,
  isResuming: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    showTour: selectors.showTourSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    isCloudFile: selectors.isCloudFileSelector(state.present),
    isOffline: selectors.isOfflineSelector(state.present),
    fileId: selectors.selectedFileIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    isResuming: selectors.isResumingSelector(state.present),
  }
}

export default connect(mapStateToProps, {
  setUserId: actions.client.setUserId,
  setFileList: actions.project.setFileList,
  setEmailAddress: actions.client.setEmailAddress,
  setHasPro: actions.client.setHasPro,
  setOffline: actions.project.setOffline,
  setPermission: actions.permission.setPermission,
})(App)
