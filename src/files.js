import { ipcRenderer, shell } from 'electron'
import { getCurrentWindow, app, dialog } from '@electron/remote'
import fs, { readFileSync } from 'fs'
import path from 'path'

import { t } from 'plottr_locales'
import { actions, reducers, emptyFile, selectors } from 'pltr/v2'

import { closeDashboard } from './dashboard-events'
import { store } from './app/store'
import { logger } from './logger'
import { uploadToFirebase } from './upload-to-firebase'

const fsPromises = fs.promises

const version = app.getVersion()
const moveItemToTrash = shell.trashItem

const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

export const newEmptyFile = (fileName, appVersion, currentFile) => {
  const emptyFileState = emptyFile(fileName, appVersion)
  return {
    ...emptyFileState,
    project: currentFile.project,
    client: currentFile.client,
    permission: reducers.permission(),
    error: reducers.error(),
  }
}

export const importScrivenerState = (fileName, appVersion, currentFile) => {
  const emptyFileState = emptyFile(fileName, appVersion)
  return {
    ...emptyFileState,
    beats: currentFile.beats || emptyFileState.beats,
    cards: currentFile.cards.length ? currentFile.cards : emptyFileState.cards,
    characters: currentFile.characters.length ? currentFile.characters : emptyFileState.characters,
    lines: currentFile.lines.length ? currentFile.lines : emptyFileState.lines,
    notes: currentFile.notes.length ? currentFile.notes : emptyFileState.notes,
    places: currentFile.places.length ? currentFile.places : emptyFileState.places,
    project: currentFile.project,
    client: currentFile.client,
    permission: reducers.permission(),
    error: reducers.error(),
  }
}

export const newFile = (
  emailAddress,
  userId,
  fileList,
  fullState,
  clientId,
  template,
  openFile
) => {
  const untitledFileList = fileList.filter(({ fileName }) => {
    return fileName && fileName.match(/Untitled/g)
  })
  const fileName = t('Untitled') + ` - ${untitledFileList.length}`
  const file = Object.assign(newEmptyFile(fileName, version, fullState.present), template || {})

  return uploadToFirebase(emailAddress, userId, file, fileName).then((response) => {
    const fileId = response.data.fileId
    openFile(`plottr://${fileId}`, fileId, false)
    closeDashboard()
    return fileId
  })
}

export const newFileFromScrivener = (
  emailAddress,
  userId,
  fileList,
  fullState,
  clientId,
  template,
  openFile
) => {
  const untitledFileList = fileList.filter(({ fileName }) => {
    return fileName && fileName.match(/Untitled/g)
  })
  const fileName = t('Untitled') + ` - ${untitledFileList.length}`
  const file = Object.assign(
    importScrivenerState(fileName, version, fullState.present),
    template || {}
  )

  return uploadToFirebase(emailAddress, userId, file, fileName)
    .then((response) => {
      const fileId = response.data.fileId
      openFile(`plottr://${fileId}`, fileId, false)
      closeDashboard()
      return fileId
    })
    .catch((error) => {
      console.log('firebase', error)
    })
}

export const uploadExisting = (emailAddress, userId, fullState) => {
  const filePath = fullState.file.fileName
  return uploadToFirebase(
    emailAddress,
    userId,
    fullState,
    path.basename(filePath, path.extname(filePath))
  )
}

export const messageRenameFile = (fileId) => {
  const renameEvent = new Event('rename-file', { bubbles: true, cancelable: false })
  renameEvent.fileId = fileId
  document.dispatchEvent(renameEvent)
}

export const saveFile = (filePath, file) => {
  ipcRenderer.send('save-file', filePath, file)
}

export const editKnownFilePath = (oldFilePath, newFilePath) => {
  ipcRenderer.send('edit-known-file-path', oldFilePath, newFilePath)
}

const win = getCurrentWindow()

export const showSaveDialogSync = (options) => dialog.showSaveDialogSync(win, options)

const escapeFileName = (fileName) => {
  return escape(fileName.replace(/[/\\]/g, '-'))
}

export const offlineFilePathFromFileName = (filePath) => {
  const fileName = escapeFileName(filePath)
  return path.join(OFFLINE_FILE_FILES_PATH, fileName)
}

export const offlineFilePath = (file) => {
  if (file.file.fileName.startsWith(OFFLINE_FILE_FILES_PATH)) {
    return file.file.fileName
  }

  return offlineFilePathFromFileName(file.file.fileName)
}

export const renameFile = (filePath) => {
  if (filePath.startsWith('plottr://')) {
    const fileList = selectors.knownFilesSelector(store.getState().present)
    const fileId = filePath.replace(/^plottr:\/\//, '')
    if (!fileList.find(({ id }) => id === fileId)) {
      logger.error(`Coludn't find file with id: ${fileId} to rename`)
      return
    }
    if (fileId) messageRenameFile(fileId)
    return
  }
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
      store.dispatch(actions.applicationState.finishRenamingFile())
    } catch (error) {
      logger.error(error)
      store.dispatch(actions.applicationState.finishRenamingFile())
      dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
    }
  }
}

export const renameCloudBackupFile = (fileName, newName) => {
  return fsPromises
    .rename(offlineFilePathFromFileName(fileName), offlineFilePathFromFileName(newName))
    .catch((error) => {
      // Ignore errors renaming the backup file.
      return true
    })
}

export const deleteCloudBackupFile = (fileName) => {
  const filePath = offlineFilePathFromFileName(fileName)
  return fsPromises.unlink(filePath).catch((error) => {
    // Ignore errors deleting the backup file.
    return true
  })
}
