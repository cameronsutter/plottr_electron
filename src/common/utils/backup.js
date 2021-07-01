import fs from 'fs'
import path from 'path'
import { BACKUP_BASE_PATH } from './config_paths'
import SETTINGS from './settings'

export function saveBackup(filePath, data, callback) {
  if (process.env.NODE_ENV === 'development') return
  if (!SETTINGS.get('backup')) return

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

const BACKUP_FOLDER_REGEX = /^1?[0-9]_[123]?[0-9]_[0-9][0-9][0-9][0-9]/

export function isABackupFile(fileName) {
  return fileName.match(/\.pltr$/) && fileName.match(BACKUP_FOLDER_REGEX)
}

export function backupFolders(backupBaseFolder) {
  return fs
    .readdirSync(backupBaseFolder)
    .filter(
      (entry) =>
        fs.lstatSync(path.join(backupBaseFolder, entry)).isDirectory() &&
        entry.match(BACKUP_FOLDER_REGEX)
    )
}

export function backupFiles(backupBaseFolder) {
  return backupFolders(backupBaseFolder).flatMap((backupFolder) => {
    const subPath = path.join(backupBaseFolder, backupFolder)
    if (fs.lstatSync(subPath).isDirectory()) {
      return fs
        .readdirSync(subPath)
        .filter((file) => fs.lstatSync(path.join(subPath, file)).isFile())
        .map((file) => path.join(backupFolder, file))
        .filter((file) => isABackupFile(file))
    }
    return []
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
