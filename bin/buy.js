const { remote, ipcRenderer } = require('electron')
const app = remote.app
var i18n = require('format-message')
const path = require('path')
var Rollbar = require('rollbar')
let environment = process.env.NODE_ENV === 'dev' ? 'development' : 'production'
require('dotenv').config({path: path.resolve(__dirname, '..', '.env')})

let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
var rollbar = new Rollbar({
  accessToken: rollbarToken,
  handleUncaughtExceptions: process.env.NODE_ENV !== 'dev',
  handleUnhandledRejections: true,
  payload: {
    environment: environment,
    version: app.getVersion(),
    where: 'buy.html',
    os: process.platform
  }
})

if (process.env.NODE_ENV !== 'dev') {
  var log = require('electron-log')
  process.on('uncaughtException', function (err) {
    log.error(err)
    rollbar.error(err)
  })
}

i18n.setup({
  translations: require('../locales'),
  locale: app.getLocale() || 'en'
})

function makeCSS () {
  var style = document.createElement("style")
  style.innerHTML = "@keyframes highlight { 0% { background-color: none; } 50% { background-color: yellow; } 100% { background-color: none; } }"
  style.innerHTML += ".highlighted { animation: highlight 2s; animation-iteration-count: 100; }"
  return style
}

function checkForPurchaseCompletion () {
  const iframe = document.querySelector('iframe')
  if (!iframe) return
  const iframeDoc = iframe.contentDocument
  var elem = iframeDoc.querySelector('.license-key')
  if (elem) {
    clearInterval(i)
    iframeDoc.body.appendChild(makeCSS())
    const LICENSE = elem.innerHTML
    elem.className = 'license-key highlighted'
    ipcRenderer.send('license-to-verify', LICENSE)
  }
}

var i = setInterval(checkForPurchaseCompletion, 3000)

var p = document.getElementById('loadingP')
var loadingNode = document.createTextNode(i18n('Loading...'))
p.appendChild(loadingNode)

document.title = i18n('Use the code "freetrial" to get the secret discount')
