const path = require('path')
const { dialog, app } = require('electron')
const i18n = require('format-message')
// const log = require('electron-log')
// const { rollbar } = require('./rollbar')
// const FileManager = require('./file_manager')
const { emptyFileContents } = require('./helpers')
const { windows } = require('./windows')

function gracefullyNotSave () {
  dialog.showErrorBox(i18n('Saving failed'), i18n("Saving your file didn't work. Try again."))
}

function gracefullyQuit () {
  if (!app.isReady() || !windows.length) {
    dialog.showMessageBoxSync({type: 'info', buttons: [i18n('ok')], message: i18n('Plottr ran into a problem. Try opening Plottr again.'), detail: i18n('If you keep seeing this problem, email us at support@plottr.com')})
    app.quit()
  }
}

module.exports = {
  gracefullyNotSave,
  gracefullyQuit,
}
