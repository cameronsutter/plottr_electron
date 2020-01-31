const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const setupRollbar = require('./rollbar')
const rollbar = setupRollbar('backup')

const BACKUP_PATH = path.join(app.getPath('userData'), 'backups')

function backupFile(fileName, data, callback) {
  if (process.env.NODE_ENV === 'dev') return

  const filePath = path.join(BACKUP_PATH, path.basename(fileName))
  var stringState = JSON.stringify(data)
  try {
    fs.writeFile(filePath, stringState, callback)
  } catch (err) {
    log.warn(err)
    rollbar.warn(err, {fileName: filePath})
  }
}

function ensureBackupPath() {
  if (fs.existsSync(BACKUP_PATH)) return

  fs.mkdirSync(BACKUP_PATH)
}
ensureBackupPath()

module.exports = backupFile