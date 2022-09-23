import { shell, ipcRenderer } from 'electron'
import { app } from '@electron/remote'
import fs from 'fs'
import path from 'path'
import { ActionTypes } from 'pltr/v2'
import { t as i18n } from 'plottr_locales'

import log from '../../../shared/logger'
import { whenClientIsReady } from '../../../shared/socket-client/index'
import makeFileSystemAPIs from '../../api/file-system-apis'

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
  prepareErrorReport(error, errorInfo).then((body) => {
    const filePath = path.join(app.getPath('documents'), `plottr_error_report_${Date.now()}.txt`)
    fs.writeFile(filePath, body, function (err) {
      if (err) {
        log.warn(err)
      } else {
        notifyUser(filePath)
      }
    })
  })
}

function prepareErrorReport(error, errorInfo) {
  const { currentUserSettings } = makeFileSystemAPIs(whenClientIsReady)

  return currentUserSettings().then((user) => {
    const hasLicense = !!user.licenseKey
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
  })
}

function notifyUser(filePath) {
  try {
    ipcRenderer.send(
      'notify',
      i18n('Error Report created'),
      i18n('Plottr created a file named {filePath} in your Documents folder', {
        filePath: path.basename(filePath),
      })
    )
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
  shell.showItemInFolder(filePath)
}
