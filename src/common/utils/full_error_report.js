import { ipcRenderer, shell } from 'electron'
import { app, dialog } from '@electron/remote'
import fs from 'fs'
import path from 'path'
import { machineIdSync } from 'node-machine-id'
import { t } from 'plottr_locales'
import { SETTINGS, USER, trialStore } from '../../file-system/stores'
import log from 'electron-log'
import { isDevelopment } from '../../isDevelopment'
import { isWindows } from '../../isOS'

const machineID = machineIdSync(true)

export function createFullErrorReport() {
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
ERROR LOG - MAIN
----------------------------------
${mainLogContents}

----------------------------------
ERROR LOG - RENDERER
----------------------------------
${rendererLogContents}
  `
  return report
}

function notifyUser(fileName) {
  try {
    ipcRenderer('notify', {
      title: t('Error Report created'),
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
