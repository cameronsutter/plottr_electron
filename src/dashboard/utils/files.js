import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import path from 'path'
import { useMemo } from 'react'
import { sortBy } from 'lodash'
import { useKnownFilesInfo } from '../../common/utils/store_hooks'
import { knownFilesStore } from '../../file-system/stores'
import { logger } from '../../logger'

const { app } = remote

const { readdir, lstat, readFile } = fs.promises

const OFFLINE_FILE_FILES_PATH = path.join(app.getPath('userData'), 'offline')

export function useSortedKnownFiles(
  userId,
  searchTerm,
  initialFilesFromFirebase,
  checkOften = true
) {
  const [files] = useKnownFilesInfo(userId, initialFilesFromFirebase, checkOften)
  const sortedIds = useMemo(() => {
    const filteredFileIds = Object.keys(files).filter((id) => {
      if (searchTerm && searchTerm.length > 1) {
        const f = files[`${id}`]
        return (f.fileName || f.path).toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return true
      }
    })
    return sortBy(filteredFileIds, (id) => getDateValue(files[`${id}`])).reverse()
  }, [files, searchTerm, initialFilesFromFirebase])

  return [sortedIds, files]
}

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

function migrateKnownFileStore() {
  // MIGRATE ONE TIME (needed after 2020.12.1 for the dashboard)
  const needsMigration = knownFilesStore.has('byIds') || knownFilesStore.has('allIds')
  if (needsMigration) {
    // it's in the old format and we need to migrate
    // const filesById = knownFilesStore.get('byIds')
    const fileIds = knownFilesStore.get('allIds')
    const fileObjects = fileIds.reduce((acc, id, idx) => {
      const key = `byIds.${id.replace('.', '~$~')}`
      const val = knownFilesStore.get(key)
      if (val) {
        // create an entry for this file
        const newId = idx + 1
        const entry = {
          path: id,
          lastOpened: val.lastOpened,
        }
        acc[newId] = entry
      }
      return acc
    }, {})
    knownFilesStore.clear()
    knownFilesStore.set(fileObjects)
  }
}

migrateKnownFileStore()

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
