const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const setupRollbar = require('./rollbar')
const rollbar = setupRollbar('backup')
const { BACKUP_BASE_PATH } = require('./config_paths')
const SETTINGS = require('./settings')

function backupFile(fileName, data, callback) {
  if (process.env.NODE_ENV === 'dev') return
  if (!SETTINGS.get('backup')) return

  ensureBackupTodayPath()
  const partialPath = backupPath()

  const fileBaseName = path.basename(fileName)
  const startBaseName = `(start-session)-${fileBaseName}`
  const startFilePath = path.join(partialPath, startBaseName)
  if (!fs.existsSync(startFilePath)) {
    saveFile(startFilePath, data, callback)
    return
  }

  const filePath = path.join(partialPath, fileBaseName)
  saveFile(filePath, data, callback)
}

function saveFile(filePath, data, callback) {
  var stringState = JSON.stringify(data)
  fs.writeFile(filePath, stringState, callback)
}

// make the backup a daily record
// (with a separate backup for the first time saving a file that day)
function backupPath () {
  const today = new Date()

  var day = today.getDate()
  var month = today.getMonth() + 1
  var year = today.getFullYear()

  return path.join(BACKUP_BASE_PATH, `${month}_${day}_${year}`)
}

// assumes base path exists
function ensureBackupTodayPath () {
  if (process.env.NODE_ENV === 'dev') return
  if (!SETTINGS.get('backup')) return

  const backupFolder = backupPath()
  if (fs.existsSync(backupFolder)) return

  fs.mkdirSync(backupFolder)
}

function ensureBackupFullPath() {
  if (!fs.existsSync(BACKUP_BASE_PATH)) {
    fs.mkdirSync(BACKUP_BASE_PATH)
  }

  ensureBackupTodayPath()
}
ensureBackupFullPath()

module.exports = { backupFile }