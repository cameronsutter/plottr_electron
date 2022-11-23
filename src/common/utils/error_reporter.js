import { ActionTypes } from 'pltr/v2'
import { t as i18n } from 'plottr_locales'

import log from '../../../shared/logger'
import { whenClientIsReady } from '../../../shared/socket-client/index'
import makeFileSystemAPIs from '../../api/file-system-apis'
import { makeMainProcessClient } from '../../app/mainProcessClient'

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

const { userDocumentsPath, appVersion, showItemInFolder, notify } = makeMainProcessClient()

export function createErrorReport(error, errorInfo) {
  return userDocumentsPath().then((documentsPath) => {
    return prepareErrorReport(error, errorInfo).then((body) => {
      return whenClientIsReady(({ join, writeFile }) => {
        return join(documentsPath, `plottr_error_report_${Date.now()}.txt`).then((filePath) => {
          return writeFile(filePath, body, function (err) {
            if (err) {
              log.warn(err)
            } else {
              notifyUser(filePath)
            }
          })
        })
      })
    })
  })
}

function prepareErrorReport(error, errorInfo) {
  const { currentUserSettings } = makeFileSystemAPIs(whenClientIsReady)

  return appVersion().then((version) => {
    return currentUserSettings().then((user) => {
      const hasLicense = !!user.licenseKey
      const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${version}
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
  })
}

function notifyUser(filePath) {
  return whenClientIsReady(({ basename }) => {
    return basename(filePath).then((fileName) => {
      notify(
        i18n('Error Report created'),
        i18n('Plottr created a file named {filePath} in your Documents folder', {
          filePath: fileName,
        })
      )
      return showItemInFolder(filePath)
    })
  })
}
