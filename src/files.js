import { remote, ipcRenderer, shell } from 'electron'
import fs, { readFileSync } from 'fs'
import path from 'path'

import { t } from 'plottr_locales'
import { fetchFiles } from 'wired-up-firebase'
import { actions, reducers, emptyFile } from 'pltr/v2'

import { closeDashboard } from './dashboard-events'
import { store } from './app/store'
import { logger } from './logger'
import { uploadToFirebase } from './upload-to-firebase'

const fsPromises = fs.promises

const { app, dialog } = remote
const version = app.getVersion()
const moveItemToTrash = shell.moveItemToTrash

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
  const setFileList = (...args) => store.dispatch(actions.project.setFileList(...args))
  const file = Object.assign(newEmptyFile(fileName, version, fullState.present), template || {})

  return uploadToFirebase(emailAddress, userId, file, fileName).then((response) => {
    const fileId = response.data.fileId
    return fetchFiles(userId).then((newFileList) => {
      openFile(`plottr://${fileId}`, fileId, false)
      setFileList(newFileList.filter(({ deleted }) => !deleted))
      closeDashboard()
      return fileId
    })
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

const win = remote.getCurrentWindow()

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
  store.dispatch(actions.applicationState.startRenamingFile())
  if (filePath.startsWith('plottr://')) {
    const {
      present: {
        project: { fileList },
      },
    } = store.getState()
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
