import path from 'path'
import { t } from 'plottr_locales'
import log from 'electron-log'
import { app, shell } from 'electron'
import { is } from 'electron-util'

import { helpers } from 'pltr/v2'

import { getWindowById, numberOfWindows } from '../windows'
import { NODE_ENV } from '../constants'
import { getLicenseInfo } from '../license_info'
import { buildRecents } from './recents'
import { featureFlags } from '../feature_flags'
import currentSettings from '../settings'

const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')
let showInMessage = t('Show in File Explorer')
if (is.macos) {
  showInMessage = t('Show in Finder')
}

function buildFileMenu(fileURL, getTrialInfo) {
  const isCloudFile = helpers.file.urlPointsToPlottrCloud(fileURL)
  const isTemp = fileURL && fileURL.includes(TEMP_FILES_PATH)
  return Promise.all([getTrialInfo(), getLicenseInfo(), buildRecents(), currentSettings()]).then(
    ([trialInfo, licenseInfo, recents, settings]) => {
      const isPro = settings.user.frbId || isCloudFile
      let submenu = [
        {
          label: t('Create Blank Project'),
          accelerator: 'CmdOrCtrl+N',
          click: function (event, focusedWindow) {
            focusedWindow && focusedWindow.webContents.send('new-project')
          },
        },
        {
          label: t('Create From Template'),
          click: function (event, focusedWindow) {
            focusedWindow && focusedWindow.webContents.send('from-template')
          },
        },
        {
          label: t('Open Existing File'),
          accelerator: 'CmdOrCtrl+O',
          click: function (event, focusedWindow) {
            focusedWindow && focusedWindow.webContents.send('open-existing')
          },
        },
        {
          label: t('Recent Projects'),
          visible: !isPro && recents.length > 0,
          submenu: recents,
        },
        {
          type: 'separator',
        },
        {
          label: t('Save'),
          accelerator: 'CmdOrCtrl+S',
          visible: !!fileURL,
          click: function (event, focusedWindow) {
            if (isTemp) {
              focusedWindow.webContents.send('move-from-temp')
            } else {
              focusedWindow.webContents.send('save')
            }
          },
        },
        {
          label: t('Save as') + '...',
          accelerator: 'CmdOrCtrl+Shift+S',
          visible: !!fileURL,
          click: function (event, focusedWindow) {
            if (isPro) {
              focusedWindow.webContents.send('save-as--pro', fileURL)
            } else {
              focusedWindow.webContents.send('save-as')
            }
          },
        },
        {
          label: showInMessage,
          visible: !isPro && !isTemp,
          click: function () {
            shell.showItemInFolder(helpers.file.withoutProtocol(fileURL))
          },
        },
        {
          label: t('Duplicate'),
          accelerator: 'CmdOrCtrl+D',
          visible: !!fileURL,
          click: function (event, focusedWindow) {
            focusedWindow.webContents.send('save-as')
          },
        },
        {
          label: t('Close'),
          accelerator: 'CmdOrCtrl+W',
          visible: !!fileURL,
          click: function (event, focusedWindow) {
            log.info('sending wants-to-close')
            focusedWindow.webContents.send('wants-to-close')
          },
        },
        {
          type: 'separator',
        },
        {
          label: t('Export'),
          visible: !!fileURL,
          enabled:
            (trialInfo && !trialInfo.expired && trialInfo.startsAt) ||
            (licenseInfo && Object.keys(licenseInfo).length > 0),
          submenu: [
            {
              label: t('MS Word'),
              click: (event, focusedWindow) => {
                const options = { type: 'word' }
                focusedWindow.webContents.send('export-file-from-menu', options)
              },
            },
            {
              label: t('Scrivener'),
              click: (event, focusedWindow) => {
                const options = { type: 'scrivener' }
                focusedWindow.webContents.send('export-file-from-menu', options)
              },
            },
            {
              label: t('Advanced...'),
              click: (event, focusedWindow) => {
                focusedWindow.webContents.send('advanced-export-file-from-menu')
              },
            },
          ],
        },
        {
          label: t('Reload from File'),
          visible: NODE_ENV === 'development' && !!fileURL,
          click: (event, focusedWindow) => {
            const winObj = getWindowById(focusedWindow.id)
            if (winObj) {
              featureFlags().then((flags) => {
                focusedWindow.webContents.send(
                  'reload-from-file',
                  winObj.fileURL,
                  flags,
                  numberOfWindows()
                )
              })
            }
          },
        },
      ]
      return {
        label: t('File'),
        submenu: submenu,
      }
    }
  )
}

export { buildFileMenu }
