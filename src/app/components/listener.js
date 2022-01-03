import { useEffect, useState, useRef } from 'react'
import { ipcRenderer, remote } from 'electron'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { listen, stopListening, fetchFiles, currentUser, logOut } from 'wired-up-firebase'
import { t } from 'plottr_locales'

import { store } from '../store'
import { offlineFilePath } from '../../files'
import { logger } from '../../logger'
import { fileSystemAPIs, licenseServerAPIs } from '../../api'

const { dialog } = remote

const Listener = ({
  userId,
  emailAddress,
  selectedFile,
  setPermission,
  setFileLoaded,
  patchFile,
  clientId,
  fileLoaded,
  isOffline,
  isCloudFile,
  offlineFilePath,
  filePath,
  originalFileName,
  cloudFilePath,
  selectFile,
  setResuming,
  resuming,
  withFullFileState,
  isLoggedIn,
  checkedSession,
  setHasPro,
  setUserId,
  setEmailAddress,
  setFileList,
}) => {
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([])

  const wasOffline = useRef(isOffline)

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true
    }
  }, [isOffline])

  useEffect(() => {
    if (isOffline && isCloudFile && !selectedFile) {
      withFullFileState((state) => {
        selectFile(state.present.file)
      })
    }
  }, [isOffline, isCloudFile, selectedFile])

  useEffect(() => {
    if (!userId || !selectedFile || !selectedFile.id || selectedFile.permission) return
    fetchFiles(userId).then((fileList) => {
      const fileInList = fileList.find(({ id }) => selectedFile.id === id)
      if (fileInList) {
        setPermission(fileInList.permission)
        selectFile(fileInList)
      }
    })
  }, [selectedFile, userId])

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
    // It's not valid to change a window with an falsy name or set our
    // name to set our name to something falsy.
    if (!offlineFilePath || !cloudFilePath) return

    if (isOffline && !originalFileName) {
      ipcRenderer.send('set-my-file-path', cloudFilePath, offlineFilePath)
    } else if (!isOffline && originalFileName) {
      ipcRenderer.send('set-my-file-path', offlineFilePath, cloudFilePath)
    }
  }, [isOffline, offlineFilePath, filePath, originalFileName, cloudFilePath])

  const handleCheckPro = (uid, email) => (hasPro) => {
    if (hasPro) {
      fileSystemAPIs.saveAppSetting('user.frbId', uid)
      setHasPro(hasPro)
      setUserId(uid)
      setEmailAddress(email)
      fetchFiles(uid).then((files) => {
        const activeFiles = files.filter(({ deleted }) => !deleted)
        setFileList(activeFiles)
      })
    } else {
      logOut().then(() => {
        setUserId(null)
        setEmailAddress(null)
        dialog.showErrorBox(t('Error'), t("It doesn't look like you have a pro license."))
      })
    }
  }

  useEffect(() => {
    if (checkedSession && isLoggedIn) {
      currentUser()
        .getIdTokenResult()
        .then((token) => {
          if (token.claims.beta || token.claims.admin || token.claims.lifetime) {
            handleCheckPro(userId, emailAddress)(true)
          } else {
            if (emailAddress) {
              licenseServerAPIs
                .checkForPro(emailAddress, handleCheckPro(userId, emailAddress))
                .catch((error) => {
                  // TODO: maybe retry?
                  logger.error('Failed to check for pro', error)
                })
            }
          }
        })
    }
  }, [isLoggedIn, checkedSession, userId, emailAddress])

  return null
}

Listener.propTypes = {
  userId: PropTypes.string,
  emailAddress: PropTypes.string,
  setPermission: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  setFileLoaded: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  isOffline: PropTypes.bool,
  offlineFilePath: PropTypes.string,
  originalFileName: PropTypes.string,
  cloudFilePath: PropTypes.string,
  setResuming: PropTypes.func.isRequired,
  isCloudFile: PropTypes.bool,
  withFullFileState: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
  checkedSession: PropTypes.bool,
  setHasPro: PropTypes.func.isRequired,
  setUserId: PropTypes.func.isRequired,
  setEmailAddress: PropTypes.func.isRequired,
  setFileList: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    emailAddress: selectors.emailAddressSelector(state.present),
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
    isCloudFile: selectors.isCloudFileSelector(state.present),
    isLoggedIn: selectors.isLoggedInSelector(state.present),
    checkedSession: selectors.sessionCheckedSelector(state.present),
  }),
  {
    setPermission: actions.permission.setPermission,
    patchFile: actions.ui.patchFile,
    setFileLoaded: actions.project.setFileLoaded,
    setResuming: actions.project.setResuming,
    selectFile: actions.project.selectFile,
    withFullFileState: actions.project.withFullFileState,
    setHasPro: actions.client.setHasPro,
    setUserId: actions.client.setUserId,
    setEmailAddress: actions.client.setEmailAddress,
    setFileList: actions.project.setFileList,
  }
)(Listener)
