import { remote, ipcRenderer } from 'electron'
import path from 'path'
import axios from 'axios'

import { t } from 'plottr_locales'
import { fetchFiles } from 'wired-up-firebase'
import { actions, reducers, emptyFile } from 'pltr/v2'

import { closeDashboard } from './dashboard'
import { store } from './app/store/configureStore'

const { app } = remote
const version = app.getVersion()

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

export const uploadToFirebase = (emailAddress, userId, file, fileName) => {
  const newFile = {
    ...file.file,
    none: false,
    fileName,
    shareRecords: [{ emailAddress, permission: 'owner' }],
    version: version,
  }
  delete newFile.id
  return axios.post(
    `https://${process.env.API_BASE_DOMAIN}/api/new-file`,
    {
      fileRecord: newFile,
      file,
    },
    { params: { userId } }
  )
}

export const messageRenameFile = (fileId) => {
  const renameEvent = new Event('rename-file', { bubbles: true, cancelable: false })
  renameEvent.fileId = fileId
  document.dispatchEvent(renameEvent)
}

export const openFile = (filePath, id, unknown) => {
  ipcRenderer.send('open-known-file', filePath, id, unknown)
}
