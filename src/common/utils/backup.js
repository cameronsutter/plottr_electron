import fs from 'fs'
import { readdir, lstat } from 'fs/promises'
import path from 'path'
import log from 'electron-log'
import { shell } from 'electron'
import { DateTime, Duration } from 'luxon'
import { BACKUP_BASE_PATH } from './config_paths'
import SETTINGS from './settings'

export function saveBackup(filePath, data, callback) {
  if (process.env.NODE_ENV === 'development') return
  if (!SETTINGS.get('backup')) return

  const backupStrategy = SETTINGS.get('user.backupType')
  const amount =
    backupStrategy === 'days'
      ? SETTINGS.get('user.backupDays')
      : SETTINGS.get('user.numberOfBackups')
  deleteOldBackups(backupStrategy, amount)

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

// make the backup a daily record
// (with a separate backup for the first time saving a file that day)
function backupPath() {
  const today = new Date()

  var day = today.getDate()
  var month = today.getMonth() + 1
  var year = today.getFullYear()

  return path.join(BACKUP_BASE_PATH, `${month}_${day}_${year}`)
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
  if (!fs.existsSync(BACKUP_BASE_PATH)) {
    fs.mkdirSync(BACKUP_BASE_PATH)
  }

  ensureBackupTodayPath()
}

export function deleteOldBackups(strategy, amount) {
  // Perform this check before any file system interactions for the
  // sake of efficiency.
  if (strategy === 'never-delete') {
    log.info('Strategy set to "never-delete".  Keeping all backups.')
    return
  }

  const files = sortFileNamesByDate(backupFiles(BACKUP_BASE_PATH))

  switch (strategy) {
    case 'days': {
      const anchorDate = nDaysAgo(amount)
      const filesToDelete = files.filter((file) => !fileIsSoonerThan(anchorDate, file))
      log.warn(`Removing old backups: ${filesToDelete}`)
      filesToDelete.forEach((file) => {
        shell.moveItemToTrash(path.join(BACKUP_BASE_PATH, file))
      })
      deleteEmptyFolders()
      return
    }
    case 'number': {
      const filesToDelete = files.slice(0, files.length - amount)
      log.warn(`Removing old backups: ${filesToDelete}`)
      filesToDelete.forEach((file) => {
        shell.moveItemToTrash(path.join(BACKUP_BASE_PATH, file))
      })
      deleteEmptyFolders()
      return
    }
    default:
      log.warn(
        `Unhandled backup strategy for removing old backups (${strategy}).  Leaving everything as is.`
      )
  }
}

function deleteEmptyFolders() {
  fs.readdirSync(BACKUP_BASE_PATH)
    .filter(
      (elem) =>
        fs.lstatSync(path.join(BACKUP_BASE_PATH, elem)).isDirectory() &&
        fs.readdirSync(path.join(BACKUP_BASE_PATH, elem)).length === 0
    )
    .forEach((emptyDirectory) => fs.rmdirSync(path.join(BACKUP_BASE_PATH, emptyDirectory)))
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
  return anchorDate.subtract(Duration.fromObject({ days: n }))
}

export function fileIsSoonerThan(nDaysAgoDate, fileName) {
  const [month, day, year] = [...fileName.matchAll(/[0-9]+/g)].map((xs) => Number(xs[0]))
  return DateTime.fromObject({ day, month, year }) > nDaysAgoDate
}
