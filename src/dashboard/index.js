import path from 'path'
import i18n from 'format-message'
import log from 'electron-log'
import React from 'react'
import { render } from 'react-dom'
import DashboardMain from './DashboardMain'
import { setupI18n } from '../../locales'
import SETTINGS from '../common/utils/settings'
const { remote } = require('electron')
const app = remote.app

setupI18n(SETTINGS)

const envPath = path.resolve(__dirname, '..', '.env')
require('dotenv').config({path: envPath})
let environment = process.env.NODE_ENV === 'development' ? 'development' : 'production'
var Rollbar = require('rollbar')
let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
var rollbar = new Rollbar({
  accessToken: rollbarToken,
  handleUncaughtExceptions: process.env.NODE_ENV !== 'development',
  handleUnhandledRejections: true,
  payload: {
    environment: environment,
    version: app.getVersion(),
    where: 'dashboard.html',
    os: process.platform
  }
})

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err)
  })
}

const root = document.getElementById('dashboard__react__root')

render(<DashboardMain />, root)
