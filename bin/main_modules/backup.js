const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const setupRollbar = require('./rollbar')
const rollbar = setupRollbar('backup')

const BACKUP_BASE_PATH = path.join(app.getPath('userData'), 'backups')

function backupFile(fileName, data, callback) {
  if (process.env.NODE_ENV === 'dev') return

  // make the backup a daily record
  const filePath = path.join(backupPath(), path.basename(fileName))
  var stringState = JSON.stringify(data)
  try {
    fs.writeFile(filePath, stringState, callback)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {fileName: filePath})
  }
}

function backupPath () {
  const today = new Date()

  var day = today.getDate();
  var month = today.getMonth() + 1;
  var year = today.getFullYear();

  return path.join(BACKUP_BASE_PATH, `${month}_${day}_${year}`)
}

// assumes base path exists
function ensureBackupPath () {
  const backupFolder = backupPath()
  if (fs.existsSync(backupFolder)) return

  fs.mkdirSync(backupFolder)
}

function ensureBackupBasePath() {
  if (!fs.existsSync(BACKUP_BASE_PATH)) {
    fs.mkdirSync(BACKUP_BASE_PATH)
  }

  ensureBackupPath()
}
ensureBackupBasePath()

module.exports = backupFile