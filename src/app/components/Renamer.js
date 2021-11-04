import React from 'react'
import { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'pltr/v2'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { editFileName } from 'wired-up-firebase'

import { logger } from '../../logger'

const Renamer = ({ userId, showLoader }) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)

  const renameFile = (newName) => {
    if (!userId) {
      return
    }
    showLoader(true)
    editFileName(userId, fileId, newName)
      .then(() => {
        logger.error(`Renamed file with id ${fileId} to ${newName}`)
        setFileId(null)
        setVisible(false)
        showLoader(false)
      })
      .catch((error) => {
        logger.error(`Error renaming file with id ${fileId}`, error)
        showLoader(false)
      })
  }

  useEffect(() => {
    const renameListener = document.addEventListener('rename-file', (event) => {
      setVisible(true)
      setFileId(event.fileId)
    })
    return () => {
      document.removeEventListener('rename-file', renameListener)
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
}

export default connect(
  (state) => ({
    userId: selectors.userIdSelector(state.present),
  }),
  { showLoader: actions.project.showLoader }
)(Renamer)
