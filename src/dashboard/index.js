import path from 'path'
import log from 'electron-log'
import React from 'react'
import { ipcRenderer } from 'electron'
import { render } from 'react-dom'
import { setupI18n } from 'plottr_locales'
import SETTINGS from '../common/utils/settings'
import DashboardApp from './DashboardApp'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import MPQ from '../common/utils/MPQ'
import TemplateFetcher from './utils/template_fetcher'
import { ensureBackupFullPath } from '../common/utils/backup'

// necessary SETUP //
setupI18n(SETTINGS)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const rollbar = setupRollbar('dashboard.html')

process.on('uncaughtException', (err) => {
  log.error(err)
  rollbar.error(err)
})

// RENDER //
const root = document.getElementById('dashboard__react__root')
render(<DashboardApp />, root)

// Secondary SETUP //
window.requestIdleCallback(() => {
  ensureBackupFullPath()
  TemplateFetcher.fetch()
  initMixpanel()
})

ipcRenderer.once('send-launch', (event, version) => {
  initMixpanel()
  const settingsWeCareAbout = {
    auto_download: SETTINGS.get('user.autoDownloadUpdate'),
    backup_on: SETTINGS.get('backup'),
    locale: SETTINGS.get('locale'),
    dark: SETTINGS.get('user.dark'),
  }
  MPQ.push('Launch', { online: navigator.onLine, version: version, ...settingsWeCareAbout })
})

ipcRenderer.on('reload', () => {
  location.reload()
})
