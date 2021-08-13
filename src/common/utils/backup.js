import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import { shell } from 'electron'
import { DateTime, Duration } from 'luxon'
import { BACKUP_BASE_PATH } from './config_paths'
import SETTINGS from './settings'

const { readdir, lstat, rmdir } = fs.promises

export function saveBackup(filePath, data, callback) {
  if (process.env.NODE_ENV === 'development') return
  if (!SETTINGS.get('backup')) return

  const backupStrategy = SETTINGS.get('user.backupType') || 'never-delete'
  const amount =
    backupStrategy === 'never-delete'
      ? null
      : backupStrategy === 'days'
      ? SETTINGS.get('user.backupDays')
      : SETTINGS.get('user.numberOfBackups')
  // Don't involve deletion in the control flow of this function
  // because it'll slow things down and we don't really mind if it
  // fails.
  deleteOldBackups(backupStrategy, amount)
    .then((deleted) => {
      if (deleted.length) {
        log.info('Deleted old backups: ', deleted)
      } else {
        log.info('No old backups to delete')
      }
    })
    .catch((error) => {
      log.error('Error while deleting old backups', error)
    })

  ensureBackupTodayPath()
  const partialPath = backupPath()

  const fileBaseName = path.basename(filePath)
  const startBaseName = `(start-session)-${fileBaseName}`
  const startFilePath = path.join(partialPath, startBaseName)
  if (!fs.existsSync(startFilePath)) {
    saveFile(startFilePath, data, callback)
    return
  }

  const backupFilePath = path.join(partialPath, fileBaseName)
  saveFile(backupFilePath, data, callback)
}

function saveFile(filePath, data, callback) {
  var stringState = JSON.stringify(data)
  fs.writeFile(filePath, stringState, callback)
}

export function backupBasePath() {
  const configuredLocation = SETTINGS.get('user.backupLocation')
  return (configuredLocation !== 'default' && configuredLocation) || BACKUP_BASE_PATH
}

// make the backup a daily record
// (with a separate backup for the first time saving a file that day)
function backupPath() {
  const today = new Date()

  var day = today.getDate()
  var month = today.getMonth() + 1
  var year = today.getFullYear()

  return path.join(backupBasePath(), `${month}_${day}_${year}`)
}

// assumes base path exists
export function ensureBackupTodayPath() {
  if (process.env.NODE_ENV === 'development') return
  if (!SETTINGS.get('backup')) return

  const backupFolder = backupPath()
  if (fs.existsSync(backupFolder)) return

  fs.mkdirSync(backupFolder)
}

export function ensureBackupFullPath() {
  if (!fs.existsSync(backupBasePath())) {
    fs.mkdirSync(backupBasePath())
  }

  ensureBackupTodayPath()
}

export function deleteOldBackups(strategy, amount) {
  // Perform this check before any file system interactions for the
  // sake of efficiency.
  if (strategy === 'never-delete') {
    log.info('Strategy set to "never-delete".  Keeping all backups.')
    return Promise.resolve([])
  }

  if (!amount) {
    log.warn(`Invalid quantity for backup (with strategy: ${strategy}): ${amount}`)
    return Promise.resolve([])
  }

  return backupFiles(backupBasePath()).then((unsortedFiles) => {
    const files = sortFileNamesByDate(unsortedFiles)

    switch (strategy) {
      case 'days': {
        const anchorDate = nDaysAgo(amount)
        const filesToDelete = files.filter((file) => !fileIsSoonerThan(anchorDate, file))
        if (!filesToDelete.length) return []
        log.warn(`Removing old backups: ${filesToDelete}`)
        filesToDelete.forEach((file) => {
          shell.moveItemToTrash(path.join(backupBasePath(), file))
        })
        deleteEmptyFolders()
        return filesToDelete
      }
      case 'number': {
        const filesToDelete = files.slice(0, files.length - amount)
        if (!filesToDelete.length) return []
        log.warn(`Removing old backups: ${filesToDelete}`)
        filesToDelete.forEach((file) => {
          shell.moveItemToTrash(path.join(backupBasePath(), file))
        })
        deleteEmptyFolders()
        return filesToDelete
      }
      default:
        log.warn(
          `Unhandled backup strategy for removing old backups (${strategy}).  Leaving everything as is.`
        )
        return []
    }
  })
}

function deleteEmptyFolders() {
  return readdir(backupBasePath())
    .then((elems) =>
      Promise.all(
        elems.map((elem) =>
          lstat(path.join(backupBasePath(), elem)).then((fileStats) =>
            readdir(path.join(backupBasePath(), elem)).then((contents) => ({
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
            .map((emptyDirectory) => rmdir(path.join(backupBasePath(), emptyDirectory)))
        )
      )
    )
    .catch((error) => {
      log.error('Error while deleting empty folders', error)
    })
}

const BACKUP_FOLDER_REGEX = /^1?[0-9]_[123]?[0-9]_[0-9][0-9][0-9][0-9]/

export function isABackupFile(fileName) {
  return fileName.match(/\.pltr$/) && fileName.match(BACKUP_FOLDER_REGEX)
}

export function backupFolders(backupBaseFolder) {
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

export function backupFiles(backupBaseFolder) {
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
    return Promise.all(folderProbes).then((subFilesByFolder) => subFilesByFolder.flatMap((x) => x))
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
  const thatDateSameAsThis = thatYear === thisYear && thatMonth === thisMonth && thatDay === thisDay

  const thisIsStartFile = thisFileName.match(/\(start-session\)/)
  const thatIsStartFile = otherFileName.match(/\(start-session\)/)

  const thatBeforeThis =
    thatDateBeforeThis || (thatDateSameAsThis && thatIsStartFile && !thisIsStartFile)

  if (thatBeforeThis) return 1

  if (thatDateSameAsThis && thisIsStartFile === thatIsStartFile) return 0

  return -1
}

export function sortFileNamesByDate(fileNames) {
  return fileNames.sort(byDateThenFile)
}

export function nDaysAgo(n, anchorDate = DateTime.now()) {
  return anchorDate.minus(Duration.fromObject({ days: n }))
}

export function fileIsSoonerThan(nDaysAgoDate, fileName) {
  const [month, day, year] = [...fileName.matchAll(/[0-9]+/g)].map((xs) => Number(xs[0]))
  return DateTime.fromObject({ day, month, year }) > nDaysAgoDate
}
