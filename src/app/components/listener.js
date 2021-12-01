import { useEffect, useState, useRef } from 'react'
import { ipcRenderer } from 'electron'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { listen, stopListening } from 'wired-up-firebase'
import { store } from '../store'
import { offlineFilePath } from '../../files'
import { logger } from '../../logger'

const Listener = ({
  userId,
  selectedFile,
  setPermission,
  setFileLoaded,
  patchFile,
  clientId,
  fileLoaded,
  isOffline,
  setFileName,
  offlineFilePath,
  filePath,
  restoreFileName,
  originalFileName,
  cloudFilePath,
  setResuming,
  resuming,
}) => {
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([])

  const wasOffline = useRef(isOffline)

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true
    }
  }, [isOffline])

  useEffect(() => {
    if (!userId || !clientId || !selectedFile || !selectedFile.id || isOffline) {
      return () => {}
    }

    if (wasOffline.current) {
      logger.info(
        `Resuming online with file: ${selectedFile.id}, user: ${userId} and clientId: ${clientId}`
      )
      setResuming(true)
      wasOffline.current = false
      return () => {}
    }

    if (resuming) {
      return () => {}
    }

    if (fileLoaded) {
      setUnsubscribeFunctions(
        listen(store, userId, selectedFile.id, clientId, selectedFile.version)
      )
      setPermission(selectedFile.permission)
    } else {
      setFileLoaded()
    }

    return () => {
      stopListening(unsubscribeFunctions)
      setUnsubscribeFunctions([])
      setPermission('viewer')
    }
  }, [selectedFile, userId, clientId, fileLoaded, isOffline, resuming, setResuming])

  useEffect(() => {
    if (isOffline && unsubscribeFunctions.length) {
      stopListening(unsubscribeFunctions)
      setUnsubscribeFunctions([])
    }
  }, [isOffline, unsubscribeFunctions])

  useEffect(() => {
    if (isOffline && !originalFileName) {
      ipcRenderer.send('set-my-file-path', cloudFilePath, offlineFilePath)
      setFileName(offlineFilePath)
    } else if (!isOffline && originalFileName) {
      ipcRenderer.send('set-my-file-path', offlineFilePath, cloudFilePath)
      restoreFileName()
    }
  }, [
    isOffline,
    offlineFilePath,
    setFileName,
    filePath,
    restoreFileName,
    originalFileName,
    cloudFilePath,
  ])

  return null
}

Listener.propTypes = {
  userId: PropTypes.string,
  setPermission: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  setFileLoaded: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  isOffline: PropTypes.bool,
  setFileName: PropTypes.func.isRequired,
  offlineFilePath: PropTypes.string,
  restoreFileName: PropTypes.func.isRequired,
  originalFileName: PropTypes.string,
  cloudFilePath: PropTypes.string,
  setResuming: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    selectedFile: selectors.selectedFileSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    fileLoaded: selectors.fileLoadedSelector(state.present),
    isOffline: selectors.isOfflineSelector(state.present),
    offlineFilePath: offlineFilePath(state.present),
    filePath: selectors.filePathSelector(state.present),
    originalFileName: selectors.originalFileNameSelector(state.present),
    cloudFilePath: selectors.cloudFilePathSelector(state.present),
    resuming: selectors.isResumingSelector(state.present),
  }),
  {
    setPermission: actions.permission.setPermission,
    patchFile: actions.ui.patchFile,
    setFileLoaded: actions.project.setFileLoaded,
    setFileName: actions.ui.setFileName,
    restoreFileName: actions.ui.restoreFileName,
    setResuming: actions.project.setResuming,
  }
)(Listener)
