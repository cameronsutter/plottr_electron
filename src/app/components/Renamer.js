import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'pltr/v2'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { editFileName as editFileNameOnFirebase } from 'wired-up-firebase'

import logger from '../../../shared/logger'
import { makeMainProcessClient } from '../mainProcessClient'

const { onRenameFile } = makeMainProcessClient()

const Renamer = ({
  userId,
  showLoader,
  fileList,
  startRenamingFile,
  finishRenamingFile,
  isOffline,
  editFileName,
}) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)
  const renameOpenFile = useRef(false)

  const renameFile = (newName) => {
    // This component is for renaming cloud files only.
    if (!userId || isOffline) {
      return
    }
    startRenamingFile()
    showLoader(true)

    editFileNameOnFirebase(fileId, newName)
      .then((result) => {
        finishRenamingFile()
        return result
      })
      .then(() => {
        logger.info(`Renamed file with id ${fileId} to ${newName}`)
        setFileId(null)
        setVisible(false)
        showLoader(false)
        finishRenamingFile()
        if (renameOpenFile.current) {
          document.title = `Plottr - ${newName}`
        }
        renameOpenFile.current = false
      })
      .catch((error) => {
        logger.error(`Error renaming file with id ${fileId}`, error)
        showLoader(false)
        finishRenamingFile()
      })
  }

  useEffect(() => {
    const unsubscribeFromRenameFile = onRenameFile((fileId) => {
      setVisible(true)
      setFileId(fileId)
      renameOpenFile.current = true
    })
    const renameListener = document.addEventListener('rename-file', (event) => {
      setVisible(true)
      setFileId(event.fileId)
    })
    return () => {
      document.removeEventListener('rename-file', renameListener)
      unsubscribeFromRenameFile()
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

Renamer.propTypes = {
  userId: PropTypes.string,
  showLoader: PropTypes.func.isRequired,
  fileList: PropTypes.array.isRequired,
  startRenamingFile: PropTypes.func.isRequired,
  finishRenamingFile: PropTypes.func.isRequired,
  isOffline: PropTypes.bool.isRequired,
  editFileName: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    userId: selectors.userIdSelector(state.present),
    isCloudFile: selectors.isCloudFileSelector(state.present),
    fileList: selectors.knownFilesSelector(state.present),
    isOffline: selectors.isOfflineSelector(state.present),
  }),
  {
    showLoader: actions.project.showLoader,
    startRenamingFile: actions.applicationState.startRenamingFile,
    finishRenamingFile: actions.applicationState.finishRenamingFile,
    editFileName: actions.ui.editFileName,
  }
)(Renamer)
