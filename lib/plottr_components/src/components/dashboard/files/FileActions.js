import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Dropdown, MenuItem, Glyphicon } from 'react-bootstrap'
import UnconnectedDeleteConfirmModal from '../../dialogs/DeleteConfirmModal'

const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]

const FileActionsConnector = (connector) => {
  const {
    platform: {
      file: {
        deleteKnownFile,
        editKnownFilePath,
        removeFromKnownFiles,
        saveFile,
        isTempFile,
        readFileSync,
        moveItemToTrash,
        basename,
      },
      dialog,
      showSaveDialogSync,
      log,
      isMacOs,
      showItemInFolder,
    },
  } = connector

  let showInMessage = t('Show in File Explorer')
  if (isMacOs) {
    showInMessage = t('Show in Finder')
  }

  const DeleteConfirmModal = UnconnectedDeleteConfirmModal(connector)

  const FileActions = ({ missing, id, filePath, openFile }) => {
    const [deleting, setDeleting] = useState(false)

    const deleteFile = () => {
      setDeleting(false)
      deleteKnownFile(id, filePath)
    }

    const renameFile = () => {
      const fileName = showSaveDialogSync({
        filters,
        title: t('Give this file a new name'),
        defaultPath: filePath,
      })
      if (fileName) {
        try {
          let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
          editKnownFilePath(filePath, newFilePath)
          const contents = JSON.parse(readFileSync(filePath, 'utf-8'))
          saveFile(newFilePath, contents)
          moveItemToTrash(filePath, true)
        } catch (error) {
          log.error(error)
          dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
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
          renameFile()
          break
        case 'remove':
          removeFromKnownFiles(id)
          break
        case 'delete':
          setDeleting(true)
          break
      }
    }

    const isTemp = isTempFile(filePath)

    return (
      <div className="dashboard__recent-files__file-actions">
        {renderDeleteFile()}
        <Dropdown id={`file-action-${id}`} onSelect={doTheThing}>
          <Dropdown.Toggle noCaret>
            <Glyphicon glyph="option-horizontal" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {missing ? null : <MenuItem eventKey="open">{t('Open')}</MenuItem>}
            {missing ? null : <MenuItem eventKey="show">{showInMessage}</MenuItem>}
            {missing ? null : <MenuItem eventKey="rename">{t('Rename')}</MenuItem>}
            {missing ? null : <MenuItem eventKey="delete">{t('Delete')}</MenuItem>}
            {(isTemp || missing) && (
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
