import path from 'path'
import log from 'electron-log'
import React from 'react'
import { render } from 'react-dom'
import { setupI18n } from '../../locales'
import SETTINGS from '../common/utils/settings'
import DashboardApp from './DashboardApp'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import { MPQ } from 'middlewares/helpers'
import TemplateFetcher from './utils/template_fetcher'
import DashboardApp from './DashboardApp'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import { ipcRenderer } from 'electron'
import { ensureBackupFullPath } from '../common/utils/backup'

// necessary SETUP //
setupI18n(SETTINGS)

// missingTranslation: 'ignore',
// formats: {
//   date: {
//     monthDay: { month: 'short', day: 'numeric' }
//   }
// }

// RENDER //
const root = document.getElementById('dashboard__react__root')
render(<DashboardApp />, root)

// SETUP //
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')})
const rollbar = setupRollbar('app.html')

process.on('uncaughtException', err => {
  log.error(err)
  rollbar.error(err)
})

window.requestIdleCallback(() => {
  initMixpanel()
  ensureBackupFullPath()
  TemplateFetcher.fetch()
})

ipcRenderer.once('send-launch', (event, version) => {
  MPQ.push('Launch', {online: navigator.onLine, version: version})
})
