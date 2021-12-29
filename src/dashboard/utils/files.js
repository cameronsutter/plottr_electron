import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import path from 'path'
import { sortBy } from 'lodash'
import { logger } from '../../logger'

const { app } = remote

const { readdir, lstat, readFile } = fs.promises

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

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
  return readdir(OFFLINE_FILE_FILES_PATH)
    .then((entries) => {
      return Promise.all(
        entries.map((entry) => {
          return lstat(path.join(OFFLINE_FILE_FILES_PATH, entry)).then((folder) => ({
            keep: folder.isFile(),
            payload: path.join(OFFLINE_FILE_FILES_PATH, entry),
          }))
        })
      )
        .then((results) => results.filter(({ keep }) => keep).map(({ payload }) => payload))
        .then((files) => {
          return Promise.all(
            files.map((file) => {
              return readFile(file).then((jsonString) => {
                try {
                  const fileData = JSON.parse(jsonString).file
                  return [
                    {
                      ...fileData,
                      path: file,
                    },
                  ]
                } catch (error) {
                  logger.error(`Error reading offline file: ${file}`, error)
                  return []
                }
              })
            })
          ).then((results) => results.flatMap((x) => x))
        })
    })
    .catch((error) => {
      logger.error(`Couldn't list the offline files directory: ${OFFLINE_FILE_FILES_PATH}`, error)
      return Promise.reject(error)
    })
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
