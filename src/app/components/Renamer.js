import React from 'react'
import { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors } from 'pltr/v2'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { editFileName } from 'plottr_firebase'

const Renamer = ({ userId }) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)

  const renameFile = (newName) => {
    if (!userId) return
    editFileName(userId, fileId, newName).then(() => {
      setFileId(null)
      setVisible(false)
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
}

export default connect((state) => ({
  userId: selectors.userIdSelector(state.present),
}))(Renamer)
