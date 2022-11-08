import { useEffect } from 'react'
import { ipcRenderer } from 'electron'
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
  showErrorBox,
}) => {
  const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)
  const { saveAsTempFile } = makeFileModule(whenClientIsReady)

  // Prevent users from changing backups by closing the backup and
  // opening a temp version instead.
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

  // ====Listen to the file on Plottr Cloud====

  // Logic to resume the current file
  useEffect(() => {
    const weDontHaveBasicInfo = !userId || !clientId || !fileURL
    const fileIsntACloudFile = !helpers.file.urlPointsToPlottrCloud(fileURL)
    const weAreResuming = offlineModeIsEnabled && resuming

    if (weDontHaveBasicInfo || fileIsntACloudFile || isOffline || weAreResuming) {
      return () => {}
    }

    let unsubscribeFunction = () => {}
    if (fileLoaded) {
      const fileId = helpers.file.fileIdFromPlottrProFile(fileURL)
      unsubscribeFunction = listen(store, userId, fileId, clientId, selectedFile.version)
      setPermission(selectedFile.permission)
    } else {
      setFileLoaded()
    }

    return unsubscribeFunction
  }, [offlineModeIsEnabled, selectedFile, userId, clientId, fileLoaded, isOffline, resuming])

  // ====Pro Session====

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
        showErrorBox(t('Error'), t("It doesn't look like you have a pro license."))
      })
    }
  }

  // Handle session changes.
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

  // ====Synchronising data file name to known file name====
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
      updateAuthFileName(fileId, fileName)
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
  showErrorBox: PropTypes.func.isRequired,
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
