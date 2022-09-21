import { ipcRenderer, shell } from 'electron'
import { getCurrentWindow, app, dialog } from '@electron/remote'
import fs, { readFileSync } from 'fs'
import path from 'path'

import { t } from 'plottr_locales'
import { helpers, actions, reducers, emptyFile, selectors } from 'pltr/v2'

import { closeDashboard } from './dashboard-events'
import { store } from './app/store'
import logger from '../shared/logger'
import { uploadToFirebase } from './upload-to-firebase'
import { whenClientIsReady } from '../shared/socket-client'

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

const newFileName = (fileList, name) => {
  if (name) {
    return name
  }

  const untitledFileList = fileList.filter(({ fileName }) => {
    return fileName && fileName.match(/Untitled/g)
  })
  return t('Untitled') + ` - ${untitledFileList.length}`
}

export const newFile = (
  emailAddress,
  userId,
  fileList,
  fullState,
  clientId,
  template,
  openFile,
  name
) => {
  const fileName = newFileName(fileList, name)
  const newFile = newEmptyFile(fileName, version, fullState.present)
  const file = Object.assign({}, newFile, template || {})
  if (!file.beats.series) {
    file.beats.series = newFile.beats.series
  }
  if (file.books[1]) {
    file.books[1].title = fileName
  }
  if (fileName) {
    file.series.name = fileName
  }
  return uploadToFirebase(emailAddress, userId, file, fileName).then((response) => {
    const fileId = response.data.fileId
    const fileURL = helpers.file.fileIdFromPlottrProFile(fileId)
    openFile(fileURL, false)
    closeDashboard()
    return fileId
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

// FIXME: we should get to a point where `whenClientIsReady` is
// injected everywhere.
export const saveFile = (fileURL, file) => {
  return whenClientIsReady(({ saveFile }) => {
    return saveFile(fileURL, file)
  })
}

export const editKnownFilePath = (oldFileURL, newFileURL) => {
  ipcRenderer.send('edit-known-file-path', oldFileURL, newFileURL)
}

const win = getCurrentWindow()

export const showSaveDialogSync = (options) => dialog.showSaveDialogSync(win, options)

export const offlineFileURLFromFile = (file) => {
  if (!file?.project?.fileURL) {
    return null
  }

  const fileURL = file?.project?.fileURL
  if (helpers.file.withoutProtocol(fileURL).startsWith(OFFLINE_FILE_FILES_PATH)) {
    return fileURL
  }

  if (!helpers.file.urlPointsToPlottrCloud(fileURL)) {
    return null
  }
  const fileId = helpers.file.fileIdFromPlottrProFile(fileURL)
  return helpers.file.filePathToFileURL(path.join(OFFLINE_FILE_FILES_PATH, fileId))
}

export const renameFile = (fileURL) => {
  const present = store.getState().present
  const isCloudFile = selectors.isCloudFileSelector(present)
  const isOffline = selectors.isOfflineSelector(present)
  if (isOffline && isCloudFile) {
    logger.info('Tried to save-as a file, but it is offline', fileURL)
    return
  }
  if (helpers.file.urlPointsToPlottrCloud(fileURL)) {
    const fileList = selectors.knownFilesSelector(present)
    const fileId = fileURL.replace(/^plottr:\/\//, '')
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
    defaultPath: fileURL,
  })
  if (fileName) {
    try {
      const newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
      const newFileURL = `device://${newFilePath}`
      editKnownFilePath(fileURL, newFileURL)
      const contents = JSON.parse(readFileSync(fileURL, 'utf-8'))
      saveFile(newFileURL, contents)
      moveItemToTrash(fileURL, true)
      store.dispatch(actions.applicationState.finishRenamingFile())
    } catch (error) {
      logger.error(error)
      store.dispatch(actions.applicationState.finishRenamingFile())
      dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
    }
  }
}

export const deleteCloudBackupFile = (fileURL) => {
  if (
    !helpers.file.isDeviceFileURL(fileURL) ||
    !helpers.file.withoutProtocol(fileURL).startsWith(OFFLINE_FILE_FILES_PATH)
  ) {
    return Promise.reject(
      new Error(`Attempted to delete an offline file for non-offline file: ${fileURL}`)
    )
  }

  const filePath = helpers.file.withoutProtocol(fileURL)
  return fsPromises.unlink(filePath).catch((error) => {
    // Ignore errors deleting the backup file.
    return true
  })
}
