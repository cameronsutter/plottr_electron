import path from 'path'
import log from 'electron-log'
import React from 'react'
import { render } from 'react-dom'
import ChoiceView from 'ChoiceView'
const { remote } = require('electron')
const app = remote.app
// import contextMenu from 'electron-context-menu'

import i18n from 'format-message'

i18n.setup({	
  translations: require('../../locales').locales,	
  locale: app.getLocale() || 'en'	
})

document.title = i18n('Plottr')

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
    where: 'verify.html',
    os: process.platform
  }
})

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err)
  })
}

const root = document.getElementById('verify__react__root')

render(<ChoiceView />, root)

// https://github.com/sindresorhus/electron-context-menu
// contextMenu({
//   prepend: (defaultActions, params, browserWindow) => []
// })
