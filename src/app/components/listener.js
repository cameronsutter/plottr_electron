import { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { listen, stopListening } from 'wired-up-firebase'
import { store } from '../store'
import { offlineFilePath } from '../../files'
import { isEqual } from 'lodash'

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
  fileName,
  restoreFileName,
  originalFileName,
}) => {
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([])

  useEffect(() => {
    if (!userId || !clientId || !selectedFile || !selectedFile.id || isOffline) {
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
  }, [selectedFile, userId, clientId, fileLoaded, isOffline])

  useEffect(() => {
    if (isOffline && unsubscribeFunctions.length) {
      stopListening(unsubscribeFunctions)
      setUnsubscribeFunctions([])
    }
  }, [isOffline, unsubscribeFunctions])

  useEffect(() => {
    if (isOffline) {
      if (!isEqual(fileName, offlineFilePath)) {
        setFileName(offlineFilePath)
      }
    } else {
      if (originalFileName) {
        restoreFileName()
      }
    }
  }, [isOffline, offlineFilePath, setFileName, fileName, restoreFileName, originalFileName])

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
}

export default connect(
  (state) => ({
    selectedFile: selectors.selectedFileSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    fileLoaded: selectors.fileLoadedSelector(state.present),
    isOffline: selectors.isOfflineSelector(state.present),
    offlineFilePath: offlineFilePath(state.present),
    fileName: selectors.fileNameSelector(state.present),
    originalFileName: selectors.originalFileNameSelector(state.present),
  }),
  {
    setPermission: actions.permission.setPermission,
    patchFile: actions.ui.patchFile,
    setFileLoaded: actions.project.setFileLoaded,
    setFileName: actions.ui.setFileName,
    restoreFileName: actions.ui.restoreFileName,
  }
)(Listener)
