import { ipcRenderer } from 'electron'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import logger from '../../../shared/logger'
import { makeMainProcessClient } from '../../app/mainProcessClient'
import { closeDashboard } from '../../dashboard-events'
import { uploadProject } from './upload_project'
import { whenClientIsReady } from '../../../shared/socket-client'

const { showOpenDialog } = makeMainProcessClient()

export const openFile = (fileURL, unknown) => {
  ipcRenderer.send('open-known-file', fileURL, unknown)
}

export function openExistingFile(loggedIn, userId, email) {
  // ask user where it is
  const properties = ['openFile', 'createDirectory']
  const filters = [{ name: t('Plottr project file'), extensions: ['pltr'] }]

  return showOpenDialog('', filters, properties).then((files) => {
    const filePath = files && files.length && files[0]

    if (typeof filePath !== 'string') {
      return Promise.resolve('No file selected')
    }

    if (loggedIn) {
      return whenClientIsReady(({ basename, extname, readFile }) => {
        return extname(filePath).then((ext) => {
          return basename(filePath, ext).then((fileName) => {
            try {
              return readFile(filePath).then((fileText) => {
                const file = JSON.parse(fileText)
                return uploadProject(
                  {
                    ...file,
                    file: {
                      ...file.file,
                      fileName,
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
              })
            } catch (error) {
              logger.error('Error uploading file', error)
              return Promise.reject(error)
            }
          })
        })
      })
    }

    ipcRenderer.send('add-to-known-files-and-open', helpers.file.filePathToFileURL(filePath))
    return Promise.resolve()
  })
}
