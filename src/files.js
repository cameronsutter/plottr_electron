import { t } from 'plottr_locales'
import { helpers, actions, reducers, emptyFile, selectors } from 'pltr/v2'

import { closeDashboard } from './dashboard-events'
import { store } from './app/store'
import logger from '../shared/logger'
import { uploadToFirebase } from './upload-to-firebase'
import { whenClientIsReady } from '../shared/socket-client'
import { makeMainProcessClient } from './app/mainProcessClient'

const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]

const { getVersion, showSaveDialog, showErrorBox, editKnownFilePath } = makeMainProcessClient()

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
  return getVersion().then((version) => {
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
      const fileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
      openFile(fileURL, false)
      closeDashboard()
      return fileId
    })
  })
}

export const uploadExisting = (emailAddress, userId, fullState) => {
  const filePath = fullState.file.fileName
  return whenClientIsReady(({ basename, extname }) => {
    return extname(filePath).then((extension) => {
      return basename(filePath, extension)
    })
  }).then((fileName) => {
    return uploadToFirebase(emailAddress, userId, fullState, fileName)
  })
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

export { editKnownFilePath }

export const offlineFileURLFromFile = (file) => {
  if (!file?.project?.fileURL) {
    return Promise.resolve(null)
  }

  const fileURL = file?.project?.fileURL
  return whenClientIsReady(({ offlineFileURL }) => {
    return offlineFileURL(fileURL)
  })
}

export const renameFile = (fileURL) => {
  const present = store.getState().present
  const isCloudFile = selectors.isCloudFileSelector(present)
  const isOffline = selectors.isOfflineSelector(present)
  if (isOffline && isCloudFile) {
    logger.info('Tried to save-as a file, but it is offline', fileURL)
    return Promise.resolve()
  }
  if (helpers.file.urlPointsToPlottrCloud(fileURL)) {
    const fileList = selectors.knownFilesSelector(present)
    const fileId = fileURL.replace(/^plottr:\/\//, '')
    if (!fileList.find(({ id }) => id === fileId)) {
      logger.error(`Coludn't find file with id: ${fileId} to rename`)
      return Promise.resolve()
    }
    if (fileId) messageRenameFile(fileId)
    return Promise.resolve()
  }
  const fileName = showSaveDialog(filters, t('Give this file a new name'), fileURL)
  if (fileName) {
    try {
      const newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
      const newFileURL = `device://${newFilePath}`
      editKnownFilePath(fileURL, newFileURL)
      return whenClientIsReady(({ readFile, moveItemToTrash }) => {
        return readFile(helpers.file.withoutProtocol(fileURL), 'utf-8').then((rawFile) => {
          const contents = JSON.parse()
          return saveFile(newFileURL, contents)
            .then(() => {
              return moveItemToTrash(fileURL, true)
            })
            .then(() => {
              store.dispatch(actions.applicationState.finishRenamingFile())
            })
        })
      })
    } catch (error) {
      logger.error(error)
      store.dispatch(actions.applicationState.finishRenamingFile())
      return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(() => {
        return Promise.reject(error)
      })
    }
  }
  return Promise.resolve()
}

export const deleteCloudBackupFile = (fileURL) => {
  return whenClientIsReady(({ offlineFileBasePath, rmRf }) => {
    return offlineFileBasePath().then((offlineFileFilesPath) => {
      if (
        !helpers.file.isDeviceFileURL(fileURL) ||
        !helpers.file.withoutProtocol(fileURL).startsWith(offlineFileFilesPath)
      ) {
        return Promise.reject(
          new Error(`Attempted to delete an offline file for non-offline file: ${fileURL}`)
        )
      }

      const filePath = helpers.file.withoutProtocol(fileURL)
      return rmRf(filePath).catch((error) => {
        // Ignore errors deleting the backup file.
        return true
      })
    })
  })
}
