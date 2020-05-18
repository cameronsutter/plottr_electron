const { app, dialog, shell } = require('electron')
const fs = require('fs')
const path = require('path')
const log = require('electron-log')
const setupRollbar = require('./rollbar')
const rollbar = setupRollbar('backup')
const i18n = require('format-message')
const { machineIdSync } = require('node-machine-id')

const machineID = machineIdSync(true)

function prepareErrorReport (userInfo, openWindowsStates) {
  var report = 'VERSION: ' + app.getVersion() + '\n\n'
  report += 'USER INFO\n'
  report += JSON.stringify(userInfo) + '\n\n'
  report += `MACHINE ID: ${machineID}\n`
  report += `PLATFORM: ${process.platform}\n`
  report += '----------------------------------\n\n'
  report += 'ERROR LOG\n'
  const logFile = log.transports.file.findLogPath()
  let logContents = null
  try{
    logContents = fs.readFileSync(logFile)
  } catch (e) {
    // no log file, no big deal
  }
  report += logContents + '\n\n'
  report += '----------------------------------\n\n'
  report += 'FILE STATE\n'
  let openFilesState = openWindowsStates.map(state => {
    return JSON.stringify(state)
  })
  report += openFilesState.join("\n\n------------\n\n")
  return report
}

function createErrorReport (userInfo, openWindowsStates) {
  const body = prepareErrorReport(userInfo, openWindowsStates)
  const fileName = path.join(app.getPath('documents'), 'plottr_error_report.txt')
  fs.writeFile(fileName, body, function(err) {
    if (err) {
      log.warn(err)
      rollbar.warn(err)
    } else {
      dialog.showMessageBoxSync({type: 'info', buttons: [i18n('ok')], message: i18n('Error Report created'), detail: i18n('Plottr created a file named plottr_error_report.txt in your Documents folder')})
      shell.showItemInFolder(fileName)
    }
  })
}

module.exports = createErrorReport
