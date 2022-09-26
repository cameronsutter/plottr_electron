import fs from 'fs'
import { join, basename } from 'path'
import { sortBy } from 'lodash'

const { lstat, mkdir, rename, readdir, rm } = fs.promises

const TRASHED_LIMIT = 30

const limitToXMostRecent = (path, logger) => {
  return readdir(path)
    .then((entries) => {
      return Promise.all(
        entries.map((entry) => {
          const fullPath = join(path, entry)
          return lstat(fullPath).then((stats) => {
            return {
              lastModified: stats.mtimeMs,
              fullPath,
            }
          })
        })
      )
    })
    .then((pathsWithStamps) => {
      const sortedNewestFirst = sortBy(pathsWithStamps, 'lastModified').reverse()
      return sortedNewestFirst.slice(TRASHED_LIMIT).map(({ fullPath }) => {
        return fullPath
      })
    })
    .then((fullFilePaths) => {
      return Promise.all(
        fullFilePaths.map((fullFilePath) => {
          logger.info(
            `Deleting trashed file: ${fullFilePath}, because we hit the limit of ${TRASHED_LIMIT} files in the trash folder.  (This process deletes the oldest files first.)`
          )
          return rm(fullFilePath)
        })
      )
    })
}

const makeTrashModile = (userDataPath, logger) => {
  const trashedFilesPath = join(userDataPath, 'trash')

  const trash = (filePath) => {
    return lstat(trashedFilesPath)
      .catch((error) => {
        if (error.code === 'ENOENT') {
          logger.info(`Trash directory does not exist.  Creating it at: ${trashedFilesPath}`)
          return mkdir(trashedFilesPath)
        }
        return Promise.reject(error)
      })
      .then(() => {
        return rename(filePath, join(trashedFilesPath, basename(filePath))).then(() => {
          return limitToXMostRecent(trashedFilesPath, logger)
        })
      })
  }

  return {
    trash,
  }
}

export default makeTrashModile
