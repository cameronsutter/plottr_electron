import { t } from 'plottr_locales'

import log from '../../../shared/logger'
import { isDevelopment } from '../../isDevelopment'
import { isWindows } from '../../isOS'
import makeFileSystemAPIs from '../../api/file-system-apis'
import { makeMainProcessClient } from '../../app/mainProcessClient'
import { whenClientIsReady } from '../../../shared/socket-client/index'

const {
  userDocumentsPath,
  showErrorBox,
  logsPath,
  getVersion,
  machineId,
  notify,
  showItemInFolder,
  pleaseTellMeWhatPlatformIAmOn,
} = makeMainProcessClient()

export function createFullErrorReport() {
  Promise.all([prepareErrorReport(), userDocumentsPath()]).then(([body, userDocumentsPath]) => {
    return whenClientIsReady(({ writeFile, join }) => {
      return join(userDocumentsPath, `plottr_error_report_${Date.now()}.txt`).then((filePath) => {
        return writeFile(filePath, body)
          .then(() => {
            notifyUser(filePath)
          })
          .catch((error) => {
            log.warn(error)
            showErrorBox(t('Error'), t('Error Creating Error Report'))
          })
      })
    })
  })
}

function prepareErrorReport() {
  return logsPath().then((appLogPath) => {
    if (isDevelopment()) {
      appLogPath = appLogPath.replace('Electron', 'plottr')
    }
    if (isWindows()) {
      // on windows app.getPath('logs') seems to be adding an extra folder that doesn't exist
      // to the logs directory that's named `Plottr`
      appLogPath = appLogPath.replace('Plottr\\', '')
    }
    log.info('appLogPath', appLogPath)
    return whenClientIsReady(({ join, readFile }) => {
      return Promise.all([
        join(appLogPath, 'main.log'),
        join(appLogPath, 'renderer.log'),
        machineId(),
        pleaseTellMeWhatPlatformIAmOn(),
      ]).then(([mainLogFile, rendererLogFile, generatedMachineID, platform]) => {
        return readFile(mainLogFile)
          .catch(() => null)
          .then((mainLogContents) => {
            return readFile(rendererLogFile)
              .catch(() => null)
              .then((rendererLogContents) => {
                const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)
                return Promise.all([
                  fileSystemAPIs.currentUserSettings(),
                  fileSystemAPIs.currentTrial(),
                  fileSystemAPIs.currentAppSettings(),
                  getVersion(),
                ]).then(([user, trial, settings, version]) => {
                  const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${version}
PLATFORM: ${platform}
MACHINE ID: ${generatedMachineID}

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
              })
          })
      })
    })
  })
}

function notifyUser(filePath) {
  whenClientIsReady(({ basename }) => {
    basename(filePath).then((basenamedFilePath) => {
      notify(
        t('Error Report created'),
        t('Plottr created a file named {filePath} in your Documents folder', {
          filePath: basenamedFilePath,
        })
      )
    })
  })
  showItemInFolder(filePath)
}
