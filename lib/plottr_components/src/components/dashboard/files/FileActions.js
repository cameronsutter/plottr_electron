import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Dropdown, MenuItem, Glyphicon } from 'react-bootstrap'
import DeleteConfirmModal from '../../dialogs/DeleteConfirmModal'
import { checkDependencies } from '../../checkDependencies'

const FileActionsConnector = (connector) => {
  const {
    platform: {
      file: { deleteKnownFile, removeFromKnownFiles, isTempFile, basename, renameFile },
      isMacOS,
      showItemInFolder,
      os,
    },
  } = connector
  checkDependencies({
    deleteKnownFile,
    removeFromKnownFiles,
    isTempFile,
    basename,
    renameFile,
    isMacOS,
    showItemInFolder,
    os,
  })

  const osIsUnknown = os === 'unknown'

  let showInMessage = t('Show in File Explorer')
  if (isMacOS) {
    showInMessage = t('Show in Finder')
  }

  const FileActions = ({ missing, id, filePath, openFile }) => {
    const [deleting, setDeleting] = useState(false)

    const deleteFile = () => {
      setDeleting(false)
      deleteKnownFile(id, filePath)
    }

    const _renameFile = () => {
      renameFile(filePath)
    }

    const renderDeleteFile = () => {
      if (!deleting) return null

      const name = basename(filePath)

      return (
        <DeleteConfirmModal name={name} onDelete={deleteFile} onCancel={() => setDeleting(false)} />
      )
    }

    const doTheThing = (eventKey) => {
      switch (eventKey) {
        case 'open':
          openFile(filePath, id)
          break
        case 'show':
          showItemInFolder(filePath)
          break
        case 'rename':
          _renameFile()
          break
        case 'remove':
          removeFromKnownFiles(id)
          break
        case 'delete':
          setDeleting(true)
          break
      }
    }

    const isTemp = filePath && isTempFile(filePath)

    return (
      <div className="dashboard__recent-files__file-actions">
        {renderDeleteFile()}
        <Dropdown id={`file-action-${id}`} onSelect={doTheThing}>
          <Dropdown.Toggle noCaret>
            <Glyphicon glyph="option-horizontal" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {missing ? null : <MenuItem eventKey="open">{t('Open')}</MenuItem>}
            {osIsUnknown || missing ? null : <MenuItem eventKey="show">{showInMessage}</MenuItem>}
            {missing ? null : <MenuItem eventKey="rename">{t('Rename')}</MenuItem>}
            {missing ? null : <MenuItem eventKey="delete">{t('Delete')}</MenuItem>}
            {(isTemp || missing) && !osIsUnknown && (
              <MenuItem eventKey="remove">{t('Remove from this list')}</MenuItem>
            )}
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

  return FileActions
}

export default FileActionsConnector
