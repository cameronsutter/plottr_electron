import { ipcRenderer } from 'electron'
import { app } from '@electron/remote'
import fs from 'fs'
import path from 'path'
import { sortBy } from 'lodash'

import { makeFileModule } from '../../app/files'
import { whenClientIsReady } from '../../../shared/socket-client'

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

const { readOfflineFiles } = makeFileModule(whenClientIsReady)

function getDateValue(fileObj) {
  if (fileObj.lastOpened) {
    return fileObj.lastOpened.toDate ? fileObj.lastOpened.toDate() : new Date(fileObj.lastOpened)
  }

  try {
    const splits = fileObj.version.replace(/-.*$/, '').split('.')
    return new Date(splits[0], parseInt(splits[1]) - 1, splits[2])
  } catch (error) {
    // do nothing
  }

  return new Date()
}

export function doesFileExist(filePath) {
  return fs.existsSync(filePath)
}

export function removeFromKnownFiles(id) {
  ipcRenderer.send('remove-from-known-files', id)
}

export function listOfflineFiles() {
  return readOfflineFiles()
}

export const sortAndSearch = (searchTerm, files) => {
  if (!files || !files.length) return [[], {}]

  const filesById = files.reduce((acc, next, index) => {
    return {
      ...acc,
      [index]: next,
    }
  }, {})
  const filteredFileIds = Object.keys(filesById).filter((id) => {
    if (searchTerm && searchTerm.length > 1) {
      const f = filesById[`${id}`]
      return (f.fileName || f.path).toLowerCase().includes(searchTerm.toLowerCase())
    } else {
      return true
    }
  })
  const sortedFileIds = sortBy(filteredFileIds, (id) => getDateValue(filesById[`${id}`])).reverse()

  return [sortedFileIds, filesById]
}

export const isOfflineFile = (filePath) => {
  return filePath.startsWith(OFFLINE_FILE_FILES_PATH)
}
