import { remote, shell } from 'electron'
import fs from 'fs'
import path from 'path'
import { machineIdSync } from 'node-machine-id'
import t from 'format-message'
import USER from './user_info'
import { trialStore } from './store_hooks'
import SETTINGS from './settings'
const { app, dialog } = remote
const log = remote.require('electron-log') // necessary to use the transports obj

const machineID = machineIdSync(true)

export function createErrorReport() {
  const body = prepareErrorReport()
  const fileName = path.join(app.getPath('documents'), `plottr_error_report_${Date.now()}.txt`)
  fs.writeFile(fileName, body, function (err) {
    if (err) {
      log.warn(err)
      dialog.showErrorBox(t('Error'), t('Error Creating Error Report'))
    } else {
      notifyUser(fileName)
    }
  })
}

function prepareErrorReport() {
  const logFile = log.transports.file.findLogPath()
  let logContents = null
  try {
    logContents = fs.readFileSync(logFile)
  } catch (e) {
    // no log file, no big deal
  }
  const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${app.getVersion()}
PLATFORM: ${process.platform}
MACHINE ID: ${machineID}

USER INFO:
${JSON.stringify(USER.store)}

TRIAL INFO:
${JSON.stringify(trialStore.store)}

CONFIG:
${JSON.stringify(SETTINGS.store)}

----------------------------------
ERROR LOG
----------------------------------
${logContents}
  `
  return report
}

function notifyUser(fileName) {
  try {
    new Notification(t('Error Report created'), {
      body: t('Plottr created a file named {fileName} in your Documents folder', {
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
