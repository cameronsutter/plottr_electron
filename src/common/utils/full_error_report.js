import { ipcRenderer, shell } from 'electron'
import { app, dialog } from '@electron/remote'
import fs from 'fs'
import path from 'path'
import { machineIdSync } from 'node-machine-id'

import { t } from 'plottr_locales'

import log from '../../../shared/logger'
import { isDevelopment } from '../../isDevelopment'
import { isWindows } from '../../isOS'
import makeFileSystemAPIs from '../../api/file-system-apis'
import { whenClientIsReady } from '../../../shared/socket-client/index'

const machineID = machineIdSync(true)

export function createFullErrorReport() {
  prepareErrorReport().then((body) => {
    const filePath = path.join(app.getPath('documents'), `plottr_error_report_${Date.now()}.txt`)
    fs.writeFile(filePath, body, function (err) {
      if (err) {
        log.warn(err)
        dialog.showErrorBox(t('Error'), t('Error Creating Error Report'))
      } else {
        notifyUser(filePath)
      }
    })
  })
}

function prepareErrorReport() {
  let appLogPath = app.getPath('logs')
  if (isDevelopment()) {
    appLogPath = appLogPath.replace('Electron', 'plottr')
  }
  if (isWindows()) {
    // on windows app.getPath('logs') seems to be adding an extra folder that doesn't exist
    // to the logs directory that's named `Plottr`
    appLogPath = appLogPath.replace('Plottr\\', '')
  }
  log.info('appLogPath', appLogPath)
  const mainLogFile = path.join(appLogPath, 'main.log')
  const rendererLogFile = path.join(appLogPath, 'renderer.log')
  let mainLogContents = null
  let rendererLogContents = null
  try {
    mainLogContents = fs.readFileSync(mainLogFile)
  } catch (e) {
    // no log file, no big deal
  }
  try {
    rendererLogContents = fs.readFileSync(rendererLogFile)
  } catch (e) {
    // no log file, no big deal
  }
  const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)
  return Promise.all([
    fileSystemAPIs.currentUserSettings(),
    fileSystemAPIs.currentTrial(),
    fileSystemAPIs.currentAppSettings(),
  ]).then(([user, trial, settings]) => {
    const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${app.getVersion()}
PLATFORM: ${process.platform}
MACHINE ID: ${machineID}

USER INFO:
${JSON.stringify(user)}

TRIAL INFO:
${JSON.stringify(trial)}

CONFIG:
${JSON.stringify(settings)}

----------------------------------
ERROR LOG - MAIN
----------------------------------
${mainLogContents}

----------------------------------
ERROR LOG - RENDERER
----------------------------------
${rendererLogContents}
  `
    return report
  })
}

function notifyUser(filePath) {
  try {
    ipcRenderer(
      'notify',
      t('Error Report created'),
      t('Plottr created a file named {filePath} in your Documents folder', {
        filePath: path.basename(filePath),
      })
    )
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
  shell.showItemInFolder(filePath)
}
