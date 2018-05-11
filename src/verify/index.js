import path from 'path'
import log from 'electron-log'
import React from 'react'
import { render } from 'react-dom'
import VerifyView from 'VerifyView'
const { remote } = require('electron')
const app = remote.app

import i18n from 'format-message'
i18n.setup({
  generateId: require('format-message-generate-id/underscored_crc32'),
  translations: require('../../locales'),
  locale: 'en' || app.getLocale()
})

require('dotenv').config({path: path.resolve(__dirname, '..', '.env')})
let environment = process.env.NODE_ENV === 'dev' ? 'development' : 'production'
var Rollbar = require('rollbar')
let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
var rollbar = new Rollbar({
  accessToken: rollbarToken,
  handleUncaughtExceptions: process.env.NODE_ENV !== 'dev',
  handleUnhandledRejections: true,
  payload: {
    environment: environment,
    version: app.getVersion(),
    where: 'verify.html',
    os: process.platform
  }
})

if (process.env.NODE_ENV !== 'dev') {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err)
  })
}

const root = document.getElementById('verify__react__root')

render(
  <VerifyView />,
  root
)
