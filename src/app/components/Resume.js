import React, { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { remote } from 'electron'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import { Spinner } from 'connected-components'

import { t } from 'plottr_locales'
import { selectors, actions, SYSTEM_REDUCER_KEYS } from 'pltr/v2'
import { MessageModal } from 'connected-components'
import { initialFetch } from 'wired-up-firebase'
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

  useEffect(() => {
    if (isResuming) {
      setChecking(true)
      let retryCount = 0
      const checkAndUploadBackup = () => {
        return initialFetch(userId, fileId, clientId, app.getVersion()).then((cloudFile) => {
          withFullFileState((state) => {
            const offlineFile = state.present
            const keysWithChanges = Object.keys(cloudFile)
              .filter((key) => SYSTEM_REDUCER_KEYS.indexOf(key) === -1)
              .reduce((acc, key) => {
                if (key === 'client') {
                  return acc
                } else if (
                  key === 'file' &&
                  cloudFile.file.fileName !== offlineFile.file.fileName
                ) {
                  return [...acc, key]
                } else if (key !== 'file' && !isEqual(cloudFile[key], offlineFile[key])) {
                  return [...acc, key]
                }
                return acc
              }, [])
            if (keysWithChanges.length) {
              setChecking(false)
              logger.info(
                `Detected that file ${fileId} has changes at keys ${keysWithChanges}.  Backing up the offline file and switching to the online file.`
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
                retryCount = 0
              })
            } else {
              logger.info(
                `After resuming, there are no changes between the local and cloud files for file with id: ${fileId}.`
              )
              setChecking(false)
              setResuming(false)
              retryCount = 0
            }
          })
        })
      }
      function handleError(error) {
        logger.error('Error trying to resume online mode', error)
        retryCount++
        if (retryCount > MAX_RETRIES) {
          setChecking(false)
          setResuming(false)
          dialog.showErrorBox(
            t('Error'),
            t('There was an error reconnecting.  Please save the file and restart Plottr.')
          )
          retryCount = 0
        } else {
          checkAndUploadBackup().catch(handleError)
        }
      }
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
      {!checking
        ? `The cloud file is different from your local copy.  We're going to create a duplicate of your local file and switch to the cloud file.`
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
