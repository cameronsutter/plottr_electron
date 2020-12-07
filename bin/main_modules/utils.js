const path = require('path')
const { dialog, app } = require('electron')
const i18n = require('format-message')
// const log = require('electron-log')
// const { rollbar } = require('./rollbar')
// const FileManager = require('./file_manager')
const { emptyFileContents } = require('./helpers')
const { windows } = require('./windows')

function importFromSnowflake (focusedWindow) {
  const title = i18n('Choose your Snowflake Pro file')
  const filters = [{name: 'Snowflake Pro file', extensions: ['snowXML']}]
  const properties = [ 'openFile' ]
  const files = dialog.showOpenDialogSync({title, filters, properties})
  if (files && files.length) {
    const importedName = files[0]
    if (importedName.includes('.snowXML')) {
      const pltrFileName = importedName.replace('.snowXML', '.pltr')
      const storyName = path.basename(importedName, '.snowXML')
      const data = emptyFileContents(storyName)
      // FileManager.save(pltrFileName, data, (err) => {
      //   if (err) {
      //     log.warn(err)
      //     rollbar.warn(err, {fileName: pltrFileName})
      //     dialog.showErrorBox(i18n('Saving failed'), i18n("Creating your file didn't work. Let's try again."))
      //     importFromSnowflake(focusedWindow)
      //   } else {
      //     openWindow(pltrFileName, data, importedName)
      //   }
      // })
    }
  }
}

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
  importFromSnowflake,
  gracefullyNotSave,
  gracefullyQuit,
}
