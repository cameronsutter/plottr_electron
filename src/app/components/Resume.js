import React, { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { remote } from 'electron'
import { connect } from 'react-redux'
import { Spinner } from 'connected-components'

import { t } from 'plottr_locales'
import { selectors, actions, SYSTEM_REDUCER_KEYS } from 'pltr/v2'
import { MessageModal } from 'connected-components'
import { initialFetch, overwriteAllKeys } from 'wired-up-firebase'
import { logger } from '../../logger'
import { uploadProject } from '../../common/utils/upload_project'
import { resumeDirective } from '../../resume'

const { app, dialog } = remote

const MAX_RETRIES = 5

const Resume = ({
  isResuming,
  setResuming,
  email,
  userId,
  fileId,
  clientId,
  withFullFileState,
  overwritingCloudWithBackup,
  checkingOfflineDrift,
  backingUpOfflineFile,
  showResumeMessageDialog,
  setCheckingForOfflineDrift,
  setOverwritingCloudWithBackup,
  setShowResumeMessageDialog,
  setBackingUpOfflineFile,
}) => {
  useEffect(() => {
    // Only resume when we're loaded up and good to go.  The hook
    // depends on email, userId etc. so we can safely guard the resume
    // process with this check.
    if (
      isResuming &&
      email &&
      userId &&
      clientId &&
      fileId &&
      !checkingOfflineDrift &&
      !overwritingCloudWithBackup
    ) {
      setCheckingForOfflineDrift(true)
      setShowResumeMessageDialog(true)
      let retryCount = 0
      const checkAndUploadBackup = () => {
        return initialFetch(userId, fileId, clientId, app.getVersion()).then((cloudFile) => {
          withFullFileState((state) => {
            const offlineFile = state.present
            const originalTimeStamp = new Date(offlineFile.file.originalTimeStamp)
            const [uploadOurs, backupOurs, doNothing] = resumeDirective(offlineFile, cloudFile)
            if (doNothing) {
              logger.info(
                `After resuming, there are no changes between the local and cloud files for file with id: ${fileId}.`
              )
              setResuming(false)
              setCheckingForOfflineDrift(false)
              setOverwritingCloudWithBackup(false)
              retryCount = 0
            } else if (uploadOurs) {
              setCheckingForOfflineDrift(false)
              setOverwritingCloudWithBackup(true)
              logger.info(
                `Detected that the online version of file with id: ${fileId} didn't cahnge, but we changed ours.  Uploading our version.`
              )
              overwriteAllKeys(fileId, clientId, offlineFile).then(() => {
                setResuming(false)
                setOverwritingCloudWithBackup(false)
              })
            } else if (backupOurs) {
              setCheckingForOfflineDrift(false)
              logger.info(
                `Detected that file ${fileId} has changes since ${originalTimeStamp}.  Backing up the offline file and switching to the online file.`
              )
              const date = new Date()
              setBackingUpOfflineFile(true)
              uploadProject(
                {
                  ...offlineFile,
                  file: {
                    ...offlineFile.file,
                    fileName: `${decodeURI(offlineFile.file.fileName)} - Resume Backup - ${
                      date.getMonth() + 1
                    }-${date.getDate()}-${date.getFullYear()}`,
                  },
                },
                email,
                userId
              ).then(() => {
                setResuming(false)
                setOverwritingCloudWithBackup(false)
                setBackingUpOfflineFile(false)
                retryCount = 0
              })
            }
          })
        })
      }
      /* eslint-disable no-inner-declarations */
      function handleError(error) {
        logger.error('Error trying to resume online mode', error)
        retryCount++
        if (retryCount > MAX_RETRIES) {
          setResuming(false)
          setCheckingForOfflineDrift(false)
          setOverwritingCloudWithBackup(false)
          dialog.showErrorBox(
            t('Error'),
            t('There was an error reconnecting.  Please save the file and restart Plottr.')
          )
          retryCount = 0
        } else {
          checkAndUploadBackup().catch(handleError)
        }
      }
      /* eslint-enable */
      checkAndUploadBackup().catch(handleError)
    }
  }, [
    isResuming,
    userId,
    email,
    fileId,
    clientId,
    checkingOfflineDrift,
    overwritingCloudWithBackup,
    setCheckingForOfflineDrift,
    setShowResumeMessageDialog,
    setResuming,
    setBackingUpOfflineFile,
  ])

  const acknowledge = () => {
    if (checkingOfflineDrift) return

    setShowResumeMessageDialog(false)
  }

  if (!isResuming && !showResumeMessageDialog) return null

  return (
    <MessageModal
      message="Reconnecting"
      onAcknowledge={acknowledge}
      disabledAcknowledge={checkingOfflineDrift}
    >
      {checkingOfflineDrift ? <Spinner /> : null}
      {backingUpOfflineFile
        ? `The cloud file is different from your local copy.  We're going to create a duplicate of your local file and switch to the cloud file.`
        : null}
      {overwritingCloudWithBackup ? 'Uploading your changes to the cloud.' : null}
      {!checkingOfflineDrift && !backingUpOfflineFile && !overwritingCloudWithBackup
        ? `No changes were detected between offline backup file and the Plottr cloud version.`
        : null}
    </MessageModal>
  )
}

Resume.propTypes = {
  isResuming: PropTypes.bool,
  setResuming: PropTypes.func.isRequired,
  userId: PropTypes.string,
  email: PropTypes.string,
  fileId: PropTypes.string,
  clientId: PropTypes.string,
  withFullFileState: PropTypes.func.isRequired,
  overwritingCloudWithBackup: PropTypes.bool,
  checkingOfflineDrift: PropTypes.bool,
  backingUpOfflineFile: PropTypes.bool,
  showResumeMessageDialog: PropTypes.bool,
  setCheckingForOfflineDrift: PropTypes.func.isRequired,
  setOverwritingCloudWithBackup: PropTypes.func.isRequired,
  setShowResumeMessageDialog: PropTypes.func.isRequired,
  setBackingUpOfflineFile: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    isResuming: selectors.isResumingSelector(state.present),
    overwritingCloudWithBackup: selectors.isOverwritingCloudWithBackupSelector(state.present),
    checkingOfflineDrift: selectors.isCheckingForOfflineDriftSelector(state.present),
    showResumeMessageDialog: selectors.showResumeMessageDialogSelector(state.present),
    backingUpOfflineFile: selectors.backingUpOfflineFileSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    email: selectors.emailAddressSelector(state.present),
    fileId: selectors.fileIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
  }),
  {
    withFullFileState: actions.project.withFullFileState,
    setResuming: actions.project.setResuming,
    setCheckingForOfflineDrift: actions.project.setCheckingForOfflineDrift,
    setOverwritingCloudWithBackup: actions.project.setOverwritingCloudWithBackup,
    setShowResumeMessageDialog: actions.project.setShowResumeMessageDialog,
    setBackingUpOfflineFile: actions.project.setBackingUpOfflineFile,
  }
)(Resume)
