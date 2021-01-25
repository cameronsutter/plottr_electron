import React, { useState } from 'react'
import path from 'path'
import t from 'format-message'
import { is } from 'electron-util'
import { Dropdown, MenuItem, Glyphicon } from 'react-bootstrap'
import { shell } from 'electron'
import { deleteKnownFile, editKnownFilePath, removeFromKnownFiles } from '../../../common/utils/known_files'
import DeleteConfirmModal from '../../../app/components/dialogs/DeleteConfirmModal'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'
import { saveFile } from '../../../common/utils/files'
import { remote } from 'electron'
import fs from 'fs'
const { dialog } = remote
const filters = [{name: 'Plottr file', extensions: ['pltr']}]
const win = remote.getCurrentWindow()

let showInMessage = t('Show in File Explorer')
if (is.macos) {
  showInMessage = t('Show in Finder')
}

export default function FileOptions ({missing, id, filePath, openFile}) {
  const [deleting, setDeleting] = useState(false)

  const deleteFile = () => {
    setDeleting(false)
    deleteKnownFile(id, filePath)
  }

  const renderDeleteFile = () => {
    if (!deleting) return null

    const name = path.basename(filePath)

    return <DeleteConfirmModal name={name} onDelete={deleteFile} onCancel={() => setDeleting(false)}/>
  }

  const renameFile = () => {
    const fileName = dialog.showSaveDialogSync(win, {filters, title: t('Where would you like to move it?')})
    if (fileName) {
      let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
      editKnownFilePath (filePath, newFilePath)
      const contents = fs.readFileSync(filePath, 'utf-8')
      saveFile(newFilePath, contents)
      shell.moveItemToTrash(filePath, true)    
    }
  }
  
  const doTheThing = (eventKey) => {
    switch (eventKey) {
      case 'open':
        openFile(filePath, id)
        break
      case 'show':
        shell.showItemInFolder(filePath)
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

  const isTemp = filePath.includes(TEMP_FILES_PATH)

  return <div className='dashboard__recent-files__file-actions'>
    { renderDeleteFile() }
    <Dropdown id={`file-action-${id}`} onSelect={doTheThing}>
      <Dropdown.Toggle noCaret>
        <Glyphicon glyph='option-horizontal' />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {missing ? null : <MenuItem eventKey='open'>{t('Open')}</MenuItem>}
        {missing ? null : <MenuItem eventKey='show'>{showInMessage}</MenuItem>}
        {missing ? null : <MenuItem eventKey='rename'>{t('Rename')}</MenuItem>}
        {isTemp ? null : <MenuItem eventKey='remove'>{t('Remove from this list')}</MenuItem>}
        {missing ? null : <MenuItem eventKey='delete'>{t('Delete')}</MenuItem>}
      </Dropdown.Menu>
    </Dropdown>
  </div>
}