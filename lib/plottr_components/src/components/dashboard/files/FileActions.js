import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { IoOpenOutline } from 'react-icons/io5'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import Glyphicon from '../../Glyphicon'
import MenuItem from '../../MenuItem'
import Dropdown from '../../Dropdown'
import DeleteConfirmModal from '../../dialogs/DeleteConfirmModal'
import { checkDependencies } from '../../checkDependencies'
import ButtonGroup from '../../ButtonGroup'
import Button from '../../Button'

const FileActionsConnector = (connector) => {
  const {
    platform: {
      file: { deleteKnownFile, removeFromKnownFiles, basename, renameFile },
      isMacOS,
      showItemInFolder,
      os,
    },
  } = connector
  checkDependencies({
    deleteKnownFile,
    removeFromKnownFiles,
    basename,
    renameFile,
    isMacOS,
    showItemInFolder,
    os,
  })

  const FileActions = ({
    missing,
    id,
    fileName,
    fileURL,
    openFile,
    permission,
    isCloudFile,
    offline,
    isOnWeb,
    isTemp,
    isInOfflineMode,
  }) => {
    const [deleting, setDeleting] = useState(false)

    const osIsUnknown = os() === 'unknown'

    let showInMessage = t('Show in File Explorer')
    if (isMacOS()) {
      showInMessage = t('Show in Finder')
    }

    const deleteFile = () => {
      setDeleting(false)
      deleteKnownFile(fileURL)
    }

    const _renameFile = () => {
      renameFile(fileURL)
    }

    const renderDeleteFile = () => {
      if (!deleting) return null

      const name = basename(helpers.file.withoutProtocol(fileURL))

      return (
        <DeleteConfirmModal
          name={fileName || name}
          onDelete={deleteFile}
          onCancel={() => setDeleting(false)}
        />
      )
    }
    const handleOpen = () => {
      openFile(fileURL)
    }

    const doTheThing = (eventKey) => {
      switch (eventKey) {
        case 'open': {
          openFile(fileURL)
          break
        }
        case 'show':
          showItemInFolder(fileURL)
          break
        case 'rename':
          _renameFile()
          break
        case 'remove':
          removeFromKnownFiles(fileURL)
          break
        case 'delete':
          setDeleting(true)
          break
      }
    }

    return (
      <div className="dashboard__recent-files__file-actions">
        {renderDeleteFile()}
        <ButtonGroup>
          {missing ? null : (
            <>
              <Button bsSize="small" onClick={handleOpen} title={t('Open')}>
                <IoOpenOutline />
              </Button>
              <Button
                bsSize="small"
                onClick={_renameFile}
                title={t('Rename')}
                disabled={isInOfflineMode}
              >
                <Glyphicon glyph="edit" />
              </Button>
              <Button
                bsSize="small"
                onClick={() => setDeleting(true)}
                title={t('Delete')}
                disabled={isInOfflineMode}
              >
                <Glyphicon glyph="trash" />
              </Button>
            </>
          )}
          {isInOfflineMode ? null : (
            <Dropdown id={`file-action-${id}`} onSelect={doTheThing}>
              <Dropdown.Toggle noCaret>
                <Glyphicon glyph="option-horizontal" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {isCloudFile || osIsUnknown || missing ? null : (
                  <MenuItem eventKey="show">{showInMessage}</MenuItem>
                )}
                {osIsUnknown ? null : (
                  <MenuItem eventKey="remove">{t('Remove from this list')}</MenuItem>
                )}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </ButtonGroup>
      </div>
    )
  }

  FileActions.propTypes = {
    missing: PropTypes.bool,
    id: PropTypes.string,
    fileURL: PropTypes.string,
    fileName: PropTypes.string,
    openFile: PropTypes.func,
    permission: PropTypes.string,
    isCloudFile: PropTypes.bool,
    offline: PropTypes.bool,
    isOnWeb: PropTypes.bool,
    isTemp: PropTypes.bool,
    isInOfflineMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state, { fileURL }) => ({
      isOnWeb: selectors.isOnWebSelector(state.present),
      isTemp: selectors.isTempFileSelector(state.present, fileURL),
      isInOfflineMode: selectors.isInOfflineModeSelector(state.present),
    }))(FileActions)
  }

  throw new Error('Could not connect FileActions')
}

export default FileActionsConnector
