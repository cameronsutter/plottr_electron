import React, { useEffect, useState } from 'react'
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
}) => {
  const [checking, setChecking] = useState(false)
  const [overwriting, setOverwriting] = useState(false)

  useEffect(() => {
    if (isResuming) {
      setChecking(true)
      let retryCount = 0
      const checkAndUploadBackup = () => {
        return initialFetch(userId, fileId, clientId, app.getVersion()).then((cloudFile) => {
          withFullFileState((state) => {
            const offlineFile = state.present
            const originalTimeStamp = new Date(offlineFile.file.originalTimeStamp)
            const currentTimeStamp = new Date(offlineFile.file.timeStamp)
            const madeOfflineEdits = currentTimeStamp > originalTimeStamp
            const madeEditsOnline = cloudFile.file.timeStamp.toDate() > originalTimeStamp
            const doNothing = !madeOfflineEdits && !madeEditsOnline
            const uploadOurs = madeOfflineEdits && !madeEditsOnline
            // Doesn't matter whether we edited locally.  We're the
            // late comer in this case
            const backupOurs = madeEditsOnline
            if (doNothing) {
              logger.info(
                `After resuming, there are no changes between the local and cloud files for file with id: ${fileId}.`
              )
              setChecking(false)
              setResuming(false)
              setOverwriting(false)
              retryCount = 0
            } else if (uploadOurs) {
              setChecking(false)
              setOverwriting(true)
              logger.info(
                `Detected that the online version of file with id: ${fileId} didn't cahnge, but we changed ours.  Uploading our version.`
              )
              overwriteAllKeys(fileId, clientId, offlineFile).then(() => {
                setOverwriting(false)
                setResuming(false)
              })
            } else if (backupOurs) {
              setChecking(false)
              logger.info(
                `Detected that file ${fileId} has changes since ${originalTimeStamp}.  Backing up the offline file and switching to the online file.`
              )
              const date = new Date()
              uploadProject(
                {
                  ...offlineFile,
                  file: {
                    ...offlineFile.file,
                    fileName: `${offlineFile.file.fileName} - Resume Backup - ${
                      date.getMonth() + 1
                    }-${date.getDate()}-${date.getFullYear()}`,
                  },
                },
                email,
                userId
              ).then(() => {
                setResuming(false)
                setOverwriting(false)
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
          setChecking(false)
          setResuming(false)
          setOverwriting(false)
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
  }, [isResuming, userId, fileId, clientId])

  const acknowledge = () => {
    if (checking || !isResuming) return

    setResuming(false)
  }

  if (!isResuming) return null

  return (
    <MessageModal message="Reconnecting" onAcknowledge={acknowledge} disabledAcknowledge={checking}>
      {checking ? <Spinner /> : null}
      {!checking && !overwriting
        ? `The cloud file is different from your local copy.  We're going to create a duplicate of your local file and switch to the cloud file.`
        : null}
      {overwriting ? 'Uploading your changes to the cloud.' : null}
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
  withFullFileState: PropTypes.func.isrequired,
}

export default connect(
  (state) => ({
    isResuming: selectors.isResumingSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    email: selectors.emailAddressSelector(state.present),
    fileId: selectors.fileIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
  }),
  { withFullFileState: actions.project.withFullFileState, setResuming: actions.project.setResuming }
)(Resume)
