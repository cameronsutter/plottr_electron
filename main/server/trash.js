import fs from 'fs'
import { join, basename } from 'path'
import { sortBy } from 'lodash'

import { helpers } from 'pltr/v2'

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

  const trashByURL = (fileURL) => {
    if (!helpers.file.isDeviceFileURL(fileURL)) {
      const message = `Requested to delete ${fileURL}, but it doesn't point at a device file`
      logger.error(message)
      return Promise.reject(new Error(message))
    }
    const filePath = helpers.file.withoutProtocol(fileURL)

    return trash(filePath)
  }

  return {
    trash,
    trashByURL,
  }
}

export default makeTrashModile
