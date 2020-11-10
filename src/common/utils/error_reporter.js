import { remote, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import i18n from 'format-message'
import USER from './user_info'
const app = remote.app

let lastAction = null

export function setLastAction (action) {
  lastAction = action
}

export function createErrorReport (error, errorInfo) {
  const body = prepareErrorReport(error, errorInfo)
  const fileName = path.join(app.getPath('documents'), `plottr_error_report_${Date.now()}.txt`)
  fs.writeFile(fileName, body, function(err) {
    if (err) {
      log.warn(err)
      rollbar.warn(err)
    } else {
      notifyUser(fileName)
    }
  })
}

function prepareErrorReport (error, errorInfo) {
  const hasLicense = !!USER.get('licenseKey')
  const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${app.getVersion()}
USER HAS LICENSE: ${hasLicense}
PLATFORM: ${process.platform}
----------------------------------
ERROR
----------------------------------
name: ${error.name}
message: ${error.message}
stack: ${error.stack}
componentStack: ${errorInfo.componentStack}
----------------------------------
LAST ACTION
----------------------------------
${JSON.stringify(lastAction)}
  `
  return report
}

function notifyUser (fileName) {
  try {
    new Notification(i18n('Error Report created'), {body: i18n('Plottr created a file named {fileName} in your Documents folder', {fileName: path.basename(fileName)}), silent: true})
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
  shell.showItemInFolder(fileName)
}
