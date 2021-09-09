import { remote } from 'electron'
import axios from 'axios'

import { t } from 'plottr_locales'
import { fetchFiles } from 'plottr_firebase'
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

export const newFile = (emailAddress, userId, fileList, fullState, clientId, template) => {
  const untitledFileList = fileList.filter(({ fileName }) => fileName.match(/Untitled/g))
  const fileName = t('Untitled') + ` - ${untitledFileList.length}`
  const setFileList = (...args) => store.dispatch(actions.project.setFileList(...args))
  const selectFile = (...args) => store.dispatch(actions.project.selectFile(...args))
  const file = Object.assign(newEmptyFile(fileName, version, fullState.present), template || {})
  const newFile = {
    ...file.file,
    none: false,
    fileName,
    shareRecords: [{ emailAddress, permission: 'owner' }],
    version: version,
  }
  delete newFile.id

  return axios
    .post(
      `${process.env.API_BASE_DOMAIN}/api/new-file`,
      {
        fileRecord: newFile,
        file,
      },
      { params: { userId } }
    )
    .then((response) => {
      const fileId = response.data.fileId
      return fetchFiles(userId).then((newFileList) => {
        setFileList(newFileList.filter(({ deleted }) => !deleted))
        selectFile({ ...newFile, id: fileId, permission: 'owner' })
        closeDashboard()
      })
    })
}
