import { remote, ipcRenderer } from 'electron'
import { readFileSync } from 'fs'
import path from 'path'

import { t } from 'plottr_locales'

import { openFile } from '../../files'
import { logger } from '../../logger'
import { closeDashboard } from '../../dashboard'
import { uploadToFirebase } from '../../files'

const win = remote.getCurrentWindow()
const { dialog } = remote

export function openExistingFile(loggedIn, userId, email) {
  // ask user where it is
  const properties = ['openFile', 'createDirectory']
  const filters = [{ name: t('Plottr project file'), extensions: ['pltr'] }]
  const files = dialog.showOpenDialogSync(win, { filters: filters, properties: properties })
  if (files && files.length) {
    if (loggedIn) {
      try {
        const fileText = readFileSync(files[0])
        const file = JSON.parse(fileText)
        const filePath = file.file.fileName
        return uploadToFirebase(
          email,
          userId,
          file,
          path.basename(filePath, path.extname(filePath))
        ).then((response) => {
          const fileId = response.data.fileId
          logger.info('Successfully uploaded file')
          openFile(`plottr://${fileId}`, fileId, false)
          closeDashboard()
          return 'File opened...'
        })
      } catch (error) {
        logger.error('Error uploading file', error)
        return Promise.reject(error)
      }
    }
    return Promise.resolve(ipcRenderer.send('add-to-known-files-and-open', files[0]))
  }
  return Promise.resolve('No file selected')
}
