import { useEffect, useState, useRef } from 'react'
import { ipcRenderer } from 'electron'
import { dialog } from '@electron/remote'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { helpers, actions, selectors } from 'pltr/v2'
import { listen, fetchFiles, getIdTokenResult, logOut, updateAuthFileName } from 'wired-up-firebase'
import { t } from 'plottr_locales'

import { store } from '../store'
import logger from '../../../shared/logger'
import { makeFileSystemAPIs, licenseServerAPIs } from '../../api'
import { whenClientIsReady } from '../../../shared/socket-client'
import { makeFileModule } from '../files'

const Listener = ({
  hasPro,
  userId,
  emailAddress,
  selectedFile,
  setPermission,
  knownFiles,
  setFileLoaded,
  patchFile,
  clientId,
  fileLoaded,
  isOffline,
  isCloudFile,
  fileURL,
  fileName,
  originalFileName,
  cloudFileURL,
  selectFile,
  offlineModeIsEnabled,
  setResuming,
  resuming,
  withFullFileState,
  isLoggedIn,
  checkedSession,
  checkingProSubscription,
  setHasPro,
  setUserId,
  setEmailAddress,
  setProLicenseInfo,
  startLoadingALicenseType,
  finishLoadingALicenseType,
}) => {
  const [unsubscribeFunction, setUnsubscribeFunction] = useState(null)

  const wasOffline = useRef(isOffline)

  const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)
  const { saveAsTempFile } = makeFileModule(whenClientIsReady)

  useEffect(() => {
    if (fileURL) {
      fileSystemAPIs.backupBasePath().then((backupPath) => {
        if (helpers.file.withoutProtocol(fileURL).startsWith(backupPath)) {
          withFullFileState((state) => {
            saveAsTempFile(state.present).then((newFileURL) => {
              ipcRenderer.send('pls-open-window', newFileURL, true)
              window.close()
            })
          })
        }
      })
    }
  }, [fileURL])

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

    if (offlineModeIsEnabled && wasOffline.current) {
      logger.info(
        `Resuming online with file: ${selectedFile.id}, user: ${userId} and clientId: ${clientId}`
      )
      setResuming(true)
      wasOffline.current = false
      return () => {}
    }

    if (offlineModeIsEnabled && resuming) {
      return () => {}
    }

    let unsubscribeFunction = null
    if (fileLoaded) {
      setUnsubscribeFunction({
        unsubscribe: listen(store, userId, selectedFile.id, clientId, selectedFile.version),
      })
      setPermission(selectedFile.permission)
    } else {
      setFileLoaded()
    }

    return () => {
      if (unsubscribeFunction && unsubscribeFunction.unsubscribe) {
        unsubscribeFunction.unsubscribe()
        setUnsubscribeFunction(null)
      }
    }
  }, [
    offlineModeIsEnabled,
    selectedFile,
    userId,
    clientId,
    fileLoaded,
    isOffline,
    resuming,
    setResuming,
  ])

  useEffect(() => {
    if (isOffline && unsubscribeFunction && unsubscribeFunction.unsubscribe) {
      unsubscribeFunction.unsubscribe()
      setUnsubscribeFunction(null)
    }
  }, [isOffline, unsubscribeFunction])

  useEffect(() => {
    // It's not valid to change a window with a falsey name or set our
    // name to set our name to something falsy.
    whenClientIsReady((client) => {
      client.offlineFileURL(fileURL).then((offlineFileURL) => {
        if (!offlineFileURL || !cloudFileURL) return

        if (isOffline && !originalFileName) {
          ipcRenderer.send('set-my-file-path', cloudFileURL, offlineFileURL)
        } else if (!isOffline && originalFileName) {
          ipcRenderer.send('set-my-file-path', offlineFileURL, cloudFileURL)
        }
      })
    })
  }, [isOffline, fileURL, originalFileName, cloudFileURL])

  const handleCheckPro = (uid, email, isLifetime, isAdmin) => (hasPro, info) => {
    if (hasPro) {
      fileSystemAPIs.saveAppSetting('user.frbId', uid)
      setHasPro(hasPro)
      setUserId(uid)
      setEmailAddress(email)
      setProLicenseInfo({
        ...info,
        expiration: isLifetime ? 'lifetime' : info.expiration,
        admin: isAdmin,
      })
      fetchFiles(uid).then((files) => {
        finishLoadingALicenseType('proSubscription')
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
    if (checkedSession && isLoggedIn && !hasPro && !checkingProSubscription) {
      startLoadingALicenseType('proSubscription')
      getIdTokenResult().then((token) => {
        if (token.claims.beta || token.claims.admin || token.claims.lifetime) {
          handleCheckPro(
            userId,
            emailAddress,
            token.claims.lifeTime || token.claims.admin,
            token.claims.admin
          )(true, { expiration: 'lifetime', admin: true })
        } else {
          if (emailAddress) {
            licenseServerAPIs
              .checkForPro(
                emailAddress,
                handleCheckPro(
                  userId,
                  emailAddress,
                  token.claims.lifeTime || token.claims.admin,
                  token.claims.admin
                )
              )
              .catch((error) => {
                // TODO: maybe retry?
                logger.error('Failed to check for pro', error)
                finishLoadingALicenseType('proSubscription')
              })
          }
        }
      })
    }
  }, [isLoggedIn, checkedSession, userId, emailAddress, hasPro, checkingProSubscription])

  useEffect(() => {
    if (!fileURL || !fileName || knownFiles.length === 0) return

    if (!helpers.file.urlPointsToPlottrCloud(fileURL)) {
      return
    }

    const knownFileRecord = knownFiles.find((file) => {
      return file.fileURL === fileURL
    })
    if (knownFileRecord && knownFileRecord.fileName !== fileName) {
      const fileId = helpers.file.withoutProtocol(fileURL)
      updateAuthFileName(userId, fileId, fileName)
    }
  }, [knownFiles, fileURL, fileName])

  return null
}

Listener.propTypes = {
  hasPro: PropTypes.bool,
  userId: PropTypes.string,
  emailAddress: PropTypes.string,
  setPermission: PropTypes.func.isRequired,
  knownFiles: PropTypes.array.isRequired,
  selectedFile: PropTypes.object,
  setFileLoaded: PropTypes.func.isRequired,
  patchFile: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  fileLoaded: PropTypes.bool,
  isOffline: PropTypes.bool,
  fileURL: PropTypes.string,
  fileName: PropTypes.string,
  originalFileName: PropTypes.string,
  cloudFileURL: PropTypes.string,
  selectFile: PropTypes.func.isRequired,
  setResuming: PropTypes.func.isRequired,
  resuming: PropTypes.bool,
  isCloudFile: PropTypes.bool,
  withFullFileState: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
  checkedSession: PropTypes.bool,
  offlineModeIsEnabled: PropTypes.bool,
  checkingProSubscription: PropTypes.bool,
  setHasPro: PropTypes.func.isRequired,
  setUserId: PropTypes.func.isRequired,
  setEmailAddress: PropTypes.func.isRequired,
  setProLicenseInfo: PropTypes.func.isRequired,
  startLoadingALicenseType: PropTypes.func.isRequired,
  finishLoadingALicenseType: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    hasPro: selectors.hasProSelector(state.present),
    emailAddress: selectors.emailAddressSelector(state.present),
    selectedFile: selectors.selectedFileSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    fileLoaded: selectors.fileLoadedSelector(state.present),
    isOffline: selectors.isOfflineSelector(state.present),
    fileURL: selectors.fileURLSelector(state.present),
    fileName: selectors.fileNameSelector(state.present),
    originalFileName: selectors.originalFileNameSelector(state.present),
    cloudFileURL: selectors.cloudFilePathSelector(state.present),
    resuming: selectors.isResumingSelector(state.present),
    isCloudFile: selectors.isCloudFileSelector(state.present),
    isLoggedIn: selectors.isLoggedInSelector(state.present),
    checkedSession: selectors.sessionCheckedSelector(state.present),
    offlineModeIsEnabled: selectors.offlineModeEnabledSelector(state.present),
    checkingProSubscription: selectors.checkingProSubscriptionSelector(state.present),
    knownFiles: selectors.knownFilesSelector(state.present),
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
    setProLicenseInfo: actions.license.setProLicenseInfo,
    startLoadingALicenseType: actions.applicationState.startLoadingALicenseType,
    finishLoadingALicenseType: actions.applicationState.finishLoadingALicenseType,
  }
)(Listener)
