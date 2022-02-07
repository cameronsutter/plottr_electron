import React from 'react'
import { ipcRenderer } from 'electron'
import { useState, useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'pltr/v2'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { uploadToFirebase } from '../../upload-to-firebase'

import { logger } from '../../logger'

export const openFile = (filePath, id, unknown) => {
  ipcRenderer.send('open-known-file', filePath, id, unknown)
}

const SaveAs = ({
  emailAddress,
  clientId,
  userId,
  fileList,
  startSavingFileAs,
  finishSavingFileAs,
  withFullState,
}) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)
  const saveFileAs = useRef(false)

  const renameFile = (newName) => {
    // This component is for renaming cloud files only.
    if (!userId) {
      return
    }
    startSavingFileAs()

    withFullState((fullState) => {
      return uploadToFirebase(emailAddress, userId, fullState.present, newName)
        .then((response) => {
          const fileId = response.data.fileId
          return fileId
        })
        .then((fileId) => {
          return fileId
        })
        .then((fileId) => {
          logger.info(`Saved file with id ${fileId} as ${newName}`)
          setFileId(null)
          setVisible(false)
          finishSavingFileAs()
          saveFileAs.current = false
          return fileId
        })
        .then((fileId) => {
          ipcRenderer.send('pls-open-window', `plottr://${fileId}`, true)
        })
        .catch((error) => {
          logger.error(`Error saving file with id ${fileId} as ${newName}`, error)
          finishSavingFileAs()
        })
    })
  }

  useEffect(() => {
    ipcRenderer.on('save-as--pro', (event, fileId) => {
      setVisible(true)
      setFileId(fileId)
      saveFileAs.current = true
    })
    const renameListener = document.addEventListener('rename-file', (event) => {
      setVisible(true)
      setFileId(event.fileId)
    })
    return () => {
      document.removeEventListener('rename-file', renameListener)
      ipcRenderer.removeAllListeners('rename-file')
    }
  }, [])

  const hideRenamer = () => {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <InputModal
      title={t('Name')}
      getValue={renameFile}
      isOpen={true}
      cancel={hideRenamer}
      type="text"
    />
  )
}

SaveAs.propTypes = {
  emailAddress: PropTypes.string,
  userId: PropTypes.string,
  clientId: PropTypes.string,
  fileList: PropTypes.array.isRequired,
  startSavingFileAs: PropTypes.func.isRequired,
  finishSavingFileAs: PropTypes.func.isRequired,
  withFullState: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    fileList: selectors.knownFilesSelector(state.present),
  }),
  {
    startSavingFileAs: actions.applicationState.startSavingFileAs,
    finishSavingFileAs: actions.applicationState.finishSavingFileAs,
    withFullState: actions.project.withFullFileState,
  }
)(SaveAs)
