import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { selectors, actions } from 'pltr/v2'

import log from '../../../shared/logger'
import Navigation from './Navigation'
import Body from './Body'
import Spinner from '../components/Spinner'
import {
  AskToSaveModal,
  TemplateCreate,
  ErrorBoundary,
  ExportDialog,
  ActsHelpModal,
  UpdateNotifier,
  NewProjectInputModal,
} from 'connected-components'
import { hasPreviousAction } from '../../common/utils/error_reporter'
import { store } from '../store'
import { focusIsEditable } from '../../common/utils/undo'
import MainIntegrationContext from '../../mainIntegrationContext'
import logger from '../../../shared/logger'
import { makeMainProcessClient } from '../mainProcessClient'

const {
  onAdvancedExportFileFromMenu,
  onTurnOnActsHelp,
  onReload,
  onWantsToClose,
  pleaseReloadMenu,
} = makeMainProcessClient()

const App = ({
  forceProjectDashboard,
  userId,
  isCloudFile,
  isOffline,
  isResuming,
  userNeedsToLogin,
  sessionChecked,
  clickOnDom,
  applicationIsBusyAndCannotBeQuit,
  showErrorBox,
}) => {
  const [showTemplateCreate, setShowTemplateCreate] = useState(false)
  const [type, setType] = useState(null)
  const [showAskToSave, setShowAskToSave] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showActsGuideHelp, setShowActsGuideHelp] = useState(false)

  // FIXME: the close logic is broken and overly complicated.  I only
  // made the addition here because we found a problem close to
  // release.
  const [blockClosing, setBlockClosing] = useState(true)
  const isTryingToReload = useRef(false)
  const isTryingToClose = useRef(false)
  const alreadyClosingOrRefreshing = useRef(false)

  const closeOrRefresh = (shouldClose) => {
    alreadyClosingOrRefreshing.current = true
    if (isTryingToReload.current) {
      console.log('Trying to reload')
      window.location.reload()
    } else {
      console.log('Trying to close')
      if (shouldClose) window.close()
    }
  }

  useEffect(() => {
    pleaseReloadMenu()
  })

  useEffect(() => {
    if (
      !isResuming &&
      !userId &&
      isCloudFile &&
      !userNeedsToLogin &&
      !isOffline &&
      sessionChecked
    ) {
      log.error('Attempting to open a cloud file locally without being logged in.')
      showErrorBox(t('Error'), t('This appears to be a Plottr Pro file.  Please log in.'))
    }
  }, [isResuming, userId, isCloudFile, userNeedsToLogin, isOffline, sessionChecked])

  useEffect(() => {
    const saveAsTemplateListener = (event) => {
      setType(event.itemType)
      setShowTemplateCreate(true)
    }
    document.addEventListener('save-as-template-start', saveAsTemplateListener)
    const unsubscribeFromAdvancedExportFromMenu = onAdvancedExportFileFromMenu(() => {
      setShowExportDialog(true)
    })
    const unsubscribeFromTurnOnActsHelp = onTurnOnActsHelp(() => {
      setShowActsGuideHelp(true)
    })

    return () => {
      document.removeEventListener('save-as-template-start', saveAsTemplateListener)
      unsubscribeFromAdvancedExportFromMenu()
      unsubscribeFromTurnOnActsHelp()
    }
  }, [])

  const askToSave = (event) => {
    console.log(
      'In ask to save.',
      event,
      isTryingToClose.current,
      isTryingToReload.current,
      blockClosing,
      alreadyClosingOrRefreshing.current,
      applicationIsBusyAndCannotBeQuit
    )
    if (applicationIsBusyAndCannotBeQuit) {
      logger.info('The socket server is busy and we cannot quit')
      if (event.preventDefault && typeof event.preventDefault === 'function') {
        event.preventDefault()
      }
      event.returnValue = 'nope'
      return
    }
    if (alreadyClosingOrRefreshing.current) return
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
    const unsubscribeFromReload = onReload(() => {
      isTryingToReload.current = true
      askToSave({})
    })
    const unsubscribeFromWantsToClose = onWantsToClose(() => {
      log.info('received wants-to-close')
      isTryingToClose.current = true
      askToSave({})
    })
    window.addEventListener('beforeunload', askToSave)
    return () => {
      unsubscribeFromReload()
      unsubscribeFromWantsToClose()
      window.removeEventListener('beforeunload', askToSave)
    }
  }, [blockClosing, applicationIsBusyAndCannotBeQuit, closeOrRefresh])

  const dontSaveAndClose = () => {
    setBlockClosing(false)
    setShowAskToSave(false)
    closeOrRefresh(true)
  }

  const saveAndClose = (saveFile, saveOfflineFile) => () => {
    setBlockClosing(false)
    setShowAskToSave(false)
    const { present } = store.getState()
    if (isOffline) {
      saveOfflineFile(present)
    } else {
      saveFile(present.project.fileURL, present)
    }
    closeOrRefresh(true)
  }

  const renderTemplateCreate = () => {
    if (!showTemplateCreate) return null

    return <TemplateCreate type={type} close={() => setShowTemplateCreate(false)} />
  }

  const renderAskToSave = () => {
    if (!showAskToSave || isCloudFile) return null

    return (
      <MainIntegrationContext.Consumer>
        {({ saveFile }) => {
          return (
            <AskToSaveModal
              dontSave={dontSaveAndClose}
              save={saveAndClose(saveFile)}
              cancel={() => setShowAskToSave(false)}
            />
          )
        }}
      </MainIntegrationContext.Consumer>
    )
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
          <Navigation forceProjectDashboard={forceProjectDashboard} />
        </React.StrictMode>
      </ErrorBoundary>
      <main
        className="project-main tour-end"
        onClick={(event) => {
          // The other part of this click handler is in Navigation
          clickOnDom(event.clientX, event.clientY)
        }}
      >
        <React.StrictMode>
          <Body />
          <UpdateNotifier />
          <NewProjectInputModal />
        </React.StrictMode>
      </main>
      <React.StrictMode>
        <Spinner />
        {renderTemplateCreate()}
        {renderAskToSave()}
        {renderAdvanceExportModal()}
        {renderActStructureHelpModal()}
      </React.StrictMode>
    </ErrorBoundary>
  )
}

App.propTypes = {
  userId: PropTypes.string,
  forceProjectDashboard: PropTypes.bool,
  isCloudFile: PropTypes.bool,
  isOffline: PropTypes.bool,
  isResuming: PropTypes.bool,
  userNeedsToLogin: PropTypes.bool,
  sessionChecked: PropTypes.bool,
  clickOnDom: PropTypes.func,
  applicationIsBusyAndCannotBeQuit: PropTypes.bool,
  showErrorBox: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    userId: selectors.userIdSelector(state.present),
    isCloudFile: selectors.isCloudFileSelector(state.present),
    isOffline: selectors.isOfflineSelector(state.present),
    isResuming: selectors.isResumingSelector(state.present),
    userNeedsToLogin: selectors.userNeedsToLoginSelector(state.present),
    sessionChecked: selectors.sessionCheckedSelector(state.present),
    applicationIsBusyAndCannotBeQuit: selectors.busyWithWorkThatPreventsQuittingSelector(
      state.present
    ),
  }
}

export default connect(mapStateToProps, { clickOnDom: actions.domEvents.clickOnDom })(App)
