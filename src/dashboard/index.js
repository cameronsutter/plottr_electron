import path from 'path'
import i18n from 'format-message'
import log from 'electron-log'
import React from 'react'
import { render } from 'react-dom'
import { setupI18n } from '../../locales'
import SETTINGS from '../common/utils/settings'
import DashboardApp from './DashboardApp'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'

setupI18n(SETTINGS)

require('dotenv').config({path: path.resolve(__dirname, '..', '.env')})
const rollbar = setupRollbar('app.html')

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', err => {
    log.error(err)
    rollbar.error(err)
  })
}

initMixpanel()

const root = document.getElementById('dashboard__react__root')

render(<DashboardApp />, root)
