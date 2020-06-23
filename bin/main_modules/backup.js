const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const setupRollbar = require('./rollbar')
const rollbar = setupRollbar('backup')
const { BACKUP_BASE_PATH } = require('./config_paths')
const SETTINGS = require('./settings')

function backupFile(fileName, isStartOfSession, data, callback) {
  if (process.env.NODE_ENV === 'dev') return
  if (!SETTINGS.get('backup')) return

  const fileBaseName = path.basename(fileName)
  const basename = isStartOfSession ? `(start-session)-${fileBaseName}` : fileBaseName
  const partialPath = backupPath()
  let filePath = path.join(partialPath, basename)
  if (isStartOfSession && fs.existsSync(filePath)) {
    // don't overwrite the (start-session) backup file once it's been created
    filePath = path.join(partialPath, fileBaseName)
  }
  var stringState = JSON.stringify(data)
  try {
    fs.writeFile(filePath, stringState, callback)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {fileName: filePath})
  }
}

// make the backup a daily record (except for the first time opening a file that day)
function backupPath () {
  const today = new Date()

  var day = today.getDate();
  var month = today.getMonth() + 1;
  var year = today.getFullYear();

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

module.exports = backupFile