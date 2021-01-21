import React, { useState } from 'react'
import path from 'path'
import t from 'format-message'
import { is } from 'electron-util'
import { Dropdown, MenuItem, Glyphicon } from 'react-bootstrap'
import { shell } from 'electron'
import { deleteKnownFile, editKnownFilePath, displayFileName, removeFromKnownFiles } from '../../../common/utils/known_files'
import DeleteConfirmModal from '../../../app/components/dialogs/DeleteConfirmModal'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'
import { saveFile } from '../../../common/utils/files'
import { ipcRenderer, remote } from 'electron'
import i18n from 'format-message'
import { store } from 'store/configureStore'
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
    console.log('start function')
    // first, i need to open the dialog to ask the user where to save the file
    const fileName = dialog.showSaveDialogSync(win, {filters, title: i18n('Where would you like to move it?')})
    console.log('dialog')
    // take the name they chose
    if (fileName) {
      let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
      // rename it in known_files
      editKnownFilePath (filePath, newFilePath)
      // save file to disk:
      // 1. read contents of the file
      const contents = fs.readFileSync(filePath, 'utf-8')
      // 2. save the contents to the new path
      saveFile(newFilePath, contents)
      // 3. delete the file at the old path
      shell.moveItemToTrash(filePath, true)
      // change the window's title
      win.setRepresentedFilename(newFilePath)
      win.setTitle(displayFileName(newFilePath))
      // make sure it updates in the recent files list immediately
      ipcRenderer.send('pls-tell-dashboard-to-reload-recents')     
    }
  }
  
  const doTheThing = (eventKey) => {
    console.log('do the thing')
    switch (eventKey) {
      case 'open':
        openFile(filePath, id)
        break
      case 'show':
        shell.showItemInFolder(filePath)
        break
      case 'rename':
        console.log('rename case')
        renameFile()
        break
      case 'remove':
        console.log('remove')
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
        {missing ? null : <MenuItem eventKey='rename'>{t ('Rename this file')}</MenuItem>}
        {isTemp ? null : <MenuItem eventKey='remove'>{t('Remove from this list')}</MenuItem>}
        {missing ? null : <MenuItem eventKey='delete'>{t('Delete')}</MenuItem>}
      </Dropdown.Menu>
    </Dropdown>
  </div>
}