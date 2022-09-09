import { ipcRenderer } from 'electron'
import { dialog, getCurrentWindow } from '@electron/remote'
import { readFileSync } from 'fs'
import path from 'path'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import logger from '../../../shared/logger'
import { closeDashboard } from '../../dashboard-events'
import { uploadProject } from './upload_project'

const win = getCurrentWindow()

export const openFile = (fileURL, unknown) => {
  ipcRenderer.send('open-known-file', fileURL, unknown)
}

export function openExistingFile(loggedIn, userId, email) {
  // ask user where it is
  const properties = ['openFile', 'createDirectory']
  const filters = [{ name: t('Plottr project file'), extensions: ['pltr'] }]
  const files = dialog.showOpenDialogSync(win, { filters: filters, properties: properties })
  const filePath = files && files.length && files[0]

  if (typeof filePath !== 'string') {
    return Promise.resolve('No file selected')
  }

  if (loggedIn) {
    try {
      const fileText = readFileSync(filePath)
      const file = JSON.parse(fileText)
      return uploadProject(
        {
          ...file,
          file: {
            ...file.file,
            fileName: path.basename(filePath, path.extname(filePath)),
          },
        },
        email,
        userId
      ).then((response) => {
        const fileId = response.data.fileId
        if (!fileId) {
          const message = `Tried to upload project from ${filePath} but the server replied without a fileId`
          logger.error(message)
          return Promise.reject(new Error(message))
        }
        logger.info('Successfully uploaded file')
        const fileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
        openFile(fileURL, false)
        closeDashboard()
        return 'File opened...'
      })
    } catch (error) {
      logger.error('Error uploading file', error)
      return Promise.reject(error)
    }
  }

  ipcRenderer.send('add-to-known-files-and-open', helpers.file.filePathToFileURL(filePath))
  return Promise.resolve()
}
