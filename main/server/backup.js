import path from 'path'
import fs from 'fs'
import { DateTime, Duration } from 'luxon'

const { writeFile, readdir, lstat, rmdir, unlink, mkdir } = fs.promises

const BackupModule = (userDataPath) => (settings, logger) => {
  const OFFLINE_FILE_FILES_PATH = path.join(userDataPath, 'offline')

  const { readSettings } = settings

  const defaultBackupPath = path.join(userDataPath, 'backups')

  function isOfflineFileURL(fileURL) {
    return fileURL.startsWith(OFFLINE_FILE_FILES_PATH)
  }

  const backupBasePath = () => {
    return readSettings().then((settings) => {
      const configuredBackupPath = settings.user.backupLocation
      return (configuredBackupPath !== 'default' && configuredBackupPath) || defaultBackupPath
    })
  }

  function saveBackup(filePath, data) {
    logger.info(`Saving backup of: ${filePath}`)
    return backupBasePath().then((basePath) => {
      if (path.normalize(filePath).startsWith(path.normalize(basePath))) {
        const message = `Attempting to save a backup of a file that's already a backup (${filePath})!  Backups are in ${basePath}`
        logger.error(message)
        return Promise.reject(message)
      }
      const isOfflineBackupFile = isOfflineFileURL(filePath)
      if (isOfflineBackupFile) {
        return Promise.reject(`Trying to save a backup from an offline mode file: ${filePath}`)
      }
      return readSettings().then((settings) => {
        try {
          if (!settings.backup) {
            logger.warn('Backups are disabled.')
            return Promise.resolve()
          }

          const backupStrategy = settings.user.backupType || 'never-delete'
          const amount =
            backupStrategy === 'never-delete'
              ? null
              : backupStrategy === 'days'
              ? settings.user.backupDays
              : settings.user.numberOfBackups

          // Don't involve deletion in the control flow of this function
          // because it'll slow things down and we don't really mind if it
          // fails.
          deleteOldBackups(backupStrategy, amount)
            .then((deleted) => {
              if (deleted.length) {
                logger.info('Deleted old backups: ', deleted)
              } else {
                // logger.info('No old backups to delete')
              }
            })
            .catch((error) => {
              logger.error('Error while deleting old backups', error)
            })

          return ensureBackupTodayPath()
            .then(backupPath)
            .then((partialPath) => {
              const fileBaseName = path.basename(filePath)
              const startBaseName = `(start-session)-${fileBaseName}`
              const startFilePath = path.join(partialPath, startBaseName)
              const SAVED_START_OF_SESSION_BACKUP = 'saved-start-of-session-backup'
              return lstat(startFilePath)
                .catch((error) => {
                  if (error.code === 'ENOENT') {
                    return saveFile(startFilePath, data).then(() => {
                      return SAVED_START_OF_SESSION_BACKUP
                    })
                  }
                  return Promise.reject(error)
                })
                .then((result) => {
                  if (result === SAVED_START_OF_SESSION_BACKUP) {
                    return result
                  }

                  const backupFilePath = path.join(partialPath, fileBaseName)
                  return saveFile(backupFilePath, data)
                })
            })
        } catch (error) {
          return Promise.reject(error)
        }
      })
    })
  }

  function saveFile(filePath, data) {
    var stringState = JSON.stringify(data)
    return writeFile(filePath, stringState)
  }

  // make the backup a daily record
  // (with a separate backup for the first time saving a file that day)
  function backupPath() {
    const today = new Date()

    var day = today.getDate()
    var month = today.getMonth() + 1
    var year = today.getFullYear()

    return backupBasePath().then((basePath) => {
      return path.join(basePath, `${month}_${day}_${year}`)
    })
  }

  // assumes base path exists
  function ensureBackupTodayPath() {
    return readSettings().then((settings) => {
      if (!settings.backup) return true

      return backupPath().then((backupFolder) => {
        return lstat(backupFolder).catch((error) => {
          if (error.code === 'ENOENT') {
            return mkdir(backupFolder, { recursive: true })
          }
          return Promise.reject(error)
        })
      })
    })
  }

  function ensureBackupFullPath() {
    return readSettings().then((settings) => {
      return backupBasePath().then((basePath) => {
        if (!settings.backup) return true

        return lstat(basePath)
          .catch((error) => {
            if (error.code === 'ENOENT') {
              return mkdir(basePath, { recursive: true })
            }
            return Promise.reject(error)
          })
          .then(ensureBackupTodayPath)
      })
    })
  }

  function deleteOldBackups(strategy, amount) {
    // Perform this check before any file system interactions for the
    // sake of efficiency.
    if (strategy === 'never-delete') {
      // logger.info('Strategy set to "never-delete".  Keeping all backups.')
      return Promise.resolve([])
    }

    if (!amount) {
      logger.warn(`Invalid quantity for backup (with strategy: ${strategy}): ${amount}`)
      return Promise.resolve([])
    }

    return backupBasePath().then((basePath) => {
      return backupFiles(basePath).then((unsortedFiles) => {
        const files = sortFileNamesByDate(unsortedFiles)

        switch (strategy) {
          case 'days': {
            const anchorDate = nDaysAgo(amount)
            const filesToDelete = files.filter((file) => !fileIsSoonerThan(anchorDate, file))
            if (!filesToDelete.length) return []
            logger.warn(`Removing old backups: ${filesToDelete}`)
            return Promise.all(
              filesToDelete.map((file) => {
                return unlink(path.join(basePath, file)).catch((error) => {
                  logger.error(error)
                  // Ignore this error, it's not a big deal if we fail
                  // to delete an old backup
                  return Promise.resolve(true)
                })
              })
            )
              .then(deleteEmptyFolders)
              .then(() => {
                return filesToDelete
              })
          }
          case 'number': {
            const filesToDelete = files.slice(0, files.length - amount)
            if (!filesToDelete.length) return []
            logger.warn(`Removing old backups: ${filesToDelete}`)
            return Promise.all(
              filesToDelete.map((file) => {
                return unlink(path.join(basePath, file)).catch((error) => {
                  logger.error('Error deleting an old backup: ${fille}', error)
                  // Ignore this error, it's not a big deal if we fail
                  // to delete an old backup
                  return Promise.resolve(true)
                })
              })
            )
              .then(deleteEmptyFolders)
              .then(() => {
                return filesToDelete
              })
          }
          default: {
            logger.warn(
              `Unhandled backup strategy for removing old backups (${strategy}).  Leaving everything as is.`
            )
            return []
          }
        }
      })
    })
  }

  function deleteEmptyFolders() {
    return backupBasePath()
      .then((basePath) => {
        return readdir().then((elems) =>
          Promise.all(
            elems.map((elem) =>
              lstat(path.join(basePath, elem)).then((fileStats) =>
                readdir(path.join(basePath, elem)).then((contents) => ({
                  keep: fileStats.isDirectory() && contents.length === 0,
                  payload: elem,
                }))
              )
            )
          ).then((entries) =>
            // rmdir is a safe way to do this because it will check that a
            // folder is empty before deleting it.
            Promise.all(
              entries
                .filter(({ keep }) => keep)
                .map(({ payload }) => payload)
                .map((emptyDirectory) => rmdir(path.join(basePath, emptyDirectory)))
            )
          )
        )
      })
      .catch((error) => {
        logger.error('Error while deleting empty folders', error)
      })
  }

  const BACKUP_FOLDER_REGEX = /^1?[0-9]_[123]?[0-9]_[0-9][0-9][0-9][0-9]/

  function isABackupFile(fileName) {
    return fileName.match(/\.pltr$/) && fileName.match(BACKUP_FOLDER_REGEX)
  }

  function backupFolders(backupBaseFolder) {
    return readdir(backupBaseFolder).then((entries) => {
      return Promise.all(
        entries.map((entry) =>
          lstat(path.join(backupBaseFolder, entry)).then((folder) => ({
            keep: folder.isDirectory() && entry.match(BACKUP_FOLDER_REGEX),
            payload: entry,
          }))
        )
      ).then((results) => results.filter(({ keep }) => keep).map(({ payload }) => payload))
    })
  }

  function backupFiles(backupBaseFolder) {
    return backupFolders(backupBaseFolder).then((folders) => {
      const folderProbes = folders.map((backupFolder) => {
        const subPath = path.join(backupBaseFolder, backupFolder)
        return readdir(subPath).then((subFolderContents) =>
          Promise.all(
            subFolderContents.map((entry) =>
              lstat(path.join(subPath, entry)).then((entryStats) => ({
                keep: entryStats.isFile(),
                payload: entry,
              }))
            )
          ).then((files) =>
            files
              .filter(({ keep }) => keep)
              .map(({ payload }) => payload)
              .map((file) => path.join(backupFolder, file))
              .filter((file) => isABackupFile(file))
          )
        )
      })
      return Promise.all(folderProbes).then((subFilesByFolder) =>
        subFilesByFolder.flatMap((x) => x)
      )
    })
  }

  const byDateThenFile = (thisFileName, otherFileName) => {
    const [thisMonth, thisDay, thisYear] = [...thisFileName.matchAll(/[0-9]+/g)].map((xs) =>
      Number(xs[0])
    )
    const [thatMonth, thatDay, thatYear] = [...otherFileName.matchAll(/[0-9]+/g)].map((xs) =>
      Number(xs[0])
    )
    const thatDateBeforeThis =
      thatYear < thisYear ||
      (thatYear === thisYear && thatMonth < thisMonth) ||
      (thatYear === thisYear && thatMonth === thisMonth && thatDay < thisDay)
    const thatDateSameAsThis =
      thatYear === thisYear && thatMonth === thisMonth && thatDay === thisDay

    const thisIsStartFile = thisFileName.match(/\(start-session\)/)
    const thatIsStartFile = otherFileName.match(/\(start-session\)/)

    const thatBeforeThis =
      thatDateBeforeThis || (thatDateSameAsThis && thatIsStartFile && !thisIsStartFile)

    if (thatBeforeThis) return 1

    if (thatDateSameAsThis && thisIsStartFile === thatIsStartFile) return 0

    return -1
  }

  function sortFileNamesByDate(fileNames) {
    return fileNames.sort(byDateThenFile)
  }

  function nDaysAgo(n, anchorDate = DateTime.now()) {
    return anchorDate.minus(Duration.fromObject({ days: n }))
  }

  function fileIsSoonerThan(nDaysAgoDate, fileName) {
    const [month, day, year] = [...fileName.matchAll(/[0-9]+/g)].map((xs) => Number(xs[0]))
    return DateTime.fromObject({ day, month, year }) > nDaysAgoDate
  }

  return {
    defaultBackupPath,
    backupBasePath,
    saveBackup,
    ensureBackupTodayPath,
    ensureBackupFullPath,
    deleteOldBackups,
    isABackupFile,
    backupFolders,
    backupFiles,
    sortFileNamesByDate,
    nDaysAgo,
    fileIsSoonerThan,
  }
}

export default BackupModule
