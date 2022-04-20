import { shell, ipcRenderer } from 'electron'
import { app } from '@electron/remote'
import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import { ActionTypes } from 'pltr/v2'
import { t as i18n } from 'plottr_locales'
import { USER } from '../../file-system/stores'

let previousAction = null

export function setPreviousAction(action) {
  previousAction = action
}

export function hasPreviousAction() {
  if (!previousAction) return false
  if (previousAction.type == ActionTypes.FILE_LOADED) return false
  return true
}

export function getPreviousAction() {
  return previousAction
}

export function createErrorReport(error, errorInfo) {
  const body = prepareErrorReport(error, errorInfo)
  const fileName = path.join(app.getPath('documents'), `plottr_error_report_${Date.now()}.txt`)
  fs.writeFile(fileName, body, function (err) {
    if (err) {
      log.warn(err)
      rollbar.warn(err)
    } else {
      notifyUser(fileName)
    }
  })
}

function prepareErrorReport(error, errorInfo) {
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
PREVIOUS ACTION
----------------------------------
${JSON.stringify(previousAction)}
  `
  return report
}

function notifyUser(fileName) {
  try {
    ipcRenderer.send('notify', {
      title: i18n('Error Report created'),
      body: i18n('Plottr created a file named {fileName} in your Documents folder', {
        fileName: path.basename(fileName),
      }),
      silent: true,
    })
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
  shell.showItemInFolder(fileName)
}
