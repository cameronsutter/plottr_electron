import React from 'react'
import { ipcRenderer } from 'electron'
import { useState, useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'pltr/v2'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { editFileName } from 'wired-up-firebase'
import { renameCloudBackupFile } from '../../files'

import { logger } from '../../logger'

const Renamer = ({ userId, showLoader, fileList }) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)
  const renameOpenFile = useRef(false)

  const renameFile = (newName) => {
    // This component is for renaming cloud files only.
    if (!userId) {
      return
    }
    showLoader(true)
    const fileName = fileList.find(({ id }) => id === fileId)?.fileName

    ;(fileName ? renameCloudBackupFile(fileName, newName) : Promise.resolve(true))
      .then(() => {
        return editFileName(userId, fileId, newName)
      })
      .then(() => {
        logger.info(`Renamed file with id ${fileId} to ${newName}`)
        setFileId(null)
        setVisible(false)
        showLoader(false)
        if (renameOpenFile.current) {
          document.title = `Plottr - ${newName}`
        }
        renameOpenFile.current = false
      })
      .catch((error) => {
        logger.error(`Error renaming file with id ${fileId}`, error)
        showLoader(false)
      })
  }

  useEffect(() => {
    ipcRenderer.on('rename-file', (event, fileId) => {
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

Renamer.propTypes = {
  userId: PropTypes.string,
  showLoader: PropTypes.func.isRequired,
  fileList: PropTypes.array.isRequired,
}

export default connect(
  (state) => ({
    userId: selectors.userIdSelector(state.present),
    isCloudFile: selectors.isCloudFileSelector(state.present),
    fileList: selectors.fileListSelector(state.present),
  }),
  { showLoader: actions.project.showLoader }
)(Renamer)
