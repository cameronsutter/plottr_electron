import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import path from 'path'
import t from 'format-message'
import { is } from 'electron-util'
import { Dropdown, MenuItem, Glyphicon } from 'react-bootstrap'
import { shell } from 'electron'
import { deleteKnownFile, removeFromKnownFiles } from '../../../common/utils/known_files'
import DeleteConfirmModal from '../../../app/components/dialogs/DeleteConfirmModal'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'

let showInMessage = t('Show in File Explorer')
if (is.macos) {
  showInMessage = t('Show in Finder')
}

export default function FileActions({ missing, id, filePath, openFile }) {
  const [deleting, setDeleting] = useState(false)

  const deleteFile = () => {
    setDeleting(false)
    deleteKnownFile(id, filePath)
  }

  const renderDeleteFile = () => {
    if (!deleting) return null

    const name = path.basename(filePath)

    return (
      <DeleteConfirmModal name={name} onDelete={deleteFile} onCancel={() => setDeleting(false)} />
    )
  }

  const doTheThing = (eventKey) => {
    switch (eventKey) {
      case 'open':
        openFile(filePath, id)
      case 'show':
        shell.showItemInFolder(filePath)
        break
      case 'remove':
        removeFromKnownFiles(id)
        break
      case 'delete':
        setDeleting(true)
        break
    }
  }

  const isTemp = filePath.includes(TEMP_FILES_PATH)

  return (
    <div className="dashboard__recent-files__file-actions">
      {renderDeleteFile()}
      <Dropdown id={`file-option-${id}`} onSelect={doTheThing}>
        <Dropdown.Toggle noCaret>
          <Glyphicon glyph="option-horizontal" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {missing ? null : <MenuItem eventKey="open">{t('Open')}</MenuItem>}
          {missing ? null : <MenuItem eventKey="show">{showInMessage}</MenuItem>}
          {isTemp ? null : <MenuItem eventKey="remove">{t('Remove from this list')}</MenuItem>}
          {missing ? null : <MenuItem eventKey="delete">{t('Delete')}</MenuItem>}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}

FileActions.propTypes = {
  missing: PropTypes.bool,
  id: PropTypes.string,
  filePath: PropTypes.string,
  openFile: PropTypes.func,
}
