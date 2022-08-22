import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { IoOpenOutline } from 'react-icons/io5'
import { CgTrash } from 'react-icons/cg'
import { AiOutlineEdit } from 'react-icons/ai'

import { t } from 'plottr_locales'

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
    filePath,
    openFile,
    permission,
    isCloudFile,
    offline,
    isOnWeb,
    isTemp,
  }) => {
    const [deleting, setDeleting] = useState(false)

    const osIsUnknown = os() === 'unknown'

    let showInMessage = t('Show in File Explorer')
    if (isMacOS()) {
      showInMessage = t('Show in Finder')
    }

    const deleteFile = () => {
      setDeleting(false)
      if (isCloudFile) {
        deleteKnownFile(id, id)
      } else {
        deleteKnownFile(id, filePath)
      }
    }

    const _renameFile = () => {
      if (isOnWeb) {
        renameFile(id)
      } else {
        renameFile(filePath)
      }
    }

    const renderDeleteFile = () => {
      if (!deleting) return null

      const name = basename(filePath)

      return (
        <DeleteConfirmModal
          name={fileName || name}
          onDelete={deleteFile}
          onCancel={() => setDeleting(false)}
        />
      )
    }
    const handleOpen = () => {
      if (isOnWeb) {
        openFile(id, id)
      } else {
        openFile(filePath, id)
      }
    }

    const doTheThing = (eventKey) => {
      switch (eventKey) {
        case 'open': {
          if (isOnWeb) {
            openFile(id, id)
          } else {
            openFile(filePath, id)
          }
          break
        }
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

    return (
      <div className="dashboard__recent-files__file-actions">
        {renderDeleteFile()}
        <ButtonGroup>
          {missing ? null : (
            <>
              <Button bsSize="small" onClick={handleOpen}>
                <IoOpenOutline title="Open" />
              </Button>
              <Button bsSize="small" onClick={_renameFile}>
                <AiOutlineEdit title="Rename" />
              </Button>
              <Button bsSize="small" onClick={() => setDeleting(true)}>
                <CgTrash title="Delete" />
              </Button>
            </>
          )}
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
        </ButtonGroup>
      </div>
    )
  }

  FileActions.propTypes = {
    missing: PropTypes.bool,
    id: PropTypes.string,
    filePath: PropTypes.string,
    fileName: PropTypes.string,
    openFile: PropTypes.func,
    permission: PropTypes.string,
    isCloudFile: PropTypes.bool,
    offline: PropTypes.bool,
    isOnWeb: PropTypes.bool,
    isTemp: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state, { filePath }) => ({
      isOnWeb: selectors.isOnWebSelector(state.present),
      isTemp: selectors.isTempFileSelector(state.present, filePath),
    }))(FileActions)
  }

  throw new Error('Could not connect FileActions')
}

export default FileActionsConnector
