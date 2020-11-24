const path = require('path')
const { dialog, app } = require('electron')
const i18n = require('format-message')
const log = require('electron-log')
const { is } = require('electron-util')
const { rollbar } = require('./rollbar')
const { TRIAL_MODE, NODE_ENV } = require('./constants')
const UpdateManager = require('./update_manager')
const SETTINGS = require('./settings')
const { checkForActiveLicense } = require('./license_checker')
const FileManager = require('./file_manager')
const { emptyFileContents } = require('./helpers')
const { openWindow, preventsQuitting, windows } = require('./windows')
const { openDashboardWindow } = require('./windows/dashboard')

let checkedForActiveLicense = false
function checkUpdatesIfAllowed () {
  log.info('checkUpdatesIfAllowed')
  if (NODE_ENV == 'dev') return
  if (TRIAL_MODE) {
    UpdateManager.checkForUpdates(windows)
    return
  }
  log.info('checkUpdatesIfAllowed after TRIAL_MODE')

  if (checkedForActiveLicense && !SETTINGS.get('canGetUpdates')) return
  log.info('checkUpdatesIfAllowed after if checked')

  if (!checkedForActiveLicense) {
    log.info('checkUpdatesIfAllowed !checked')
    checkForActiveLicense(valid => {
      log.info('checkUpdatesIfAllowed callback for checkForActiveLicense. valid?', valid)
      checkedForActiveLicense = true
      if (valid) {
        UpdateManager.checkForUpdates(windows)
      }
    })
  } else if (SETTINGS.get('canGetUpdates')) {
    log.info('checkUpdatesIfAllowed checked')
    UpdateManager.checkForUpdates(windows)
  }
}

function askToSave (win, state, fileName, callback) {
  const choice = dialog.showMessageBoxSync(win, {type: 'question', buttons: [i18n('yes, save!'), i18n('no, just exit')], defaultId: 0, message: i18n('Would you like to save before exiting?')})
  if (choice == 0) {
    FileManager.save(fileName, state, function (err) {
      if (err) throw err
      else {
        if (typeof callback === 'string') win[callback]()
        else callback()
      }
    })
  } else {
    if (typeof callback === 'string') win[callback]()
    else callback()
  }
}

function askToCreateFile (data = {}) {
  const filters = [{name: 'Plottr file', extensions: ['pltr']}]
  const fileName = dialog.showSaveDialogSync({filters: filters, title: i18n('Where would you like to start your new file?')})
  if (fileName) {
    const fullName = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
    const storyName = path.basename(fileName, '.pltr')
    if (!Object.keys(data).length) {
      // no data
      data = emptyFileContents(storyName)
    } else {
      data.series.name = storyName
      data.books[1].title = storyName
    }
    FileManager.save(fullName, data, (err) => {
      if (err) {
        log.warn(err)
        rollbar.warn(err, {fileName: fullName})
        dialog.showErrorBox(i18n('Saving failed'), i18n("Creating your file didn't work. Let's try again."))
        askToCreateFile(data)
      } else {
        openWindow(fullName, data)
      }
    })
  }
}

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
      FileManager.save(pltrFileName, data, (err) => {
        if (err) {
          log.warn(err)
          rollbar.warn(err, {fileName: pltrFileName})
          dialog.showErrorBox(i18n('Saving failed'), i18n("Creating your file didn't work. Let's try again."))
          importFromSnowflake(focusedWindow)
        } else {
          openWindow(pltrFileName, data, importedName)
        }
      })
    }
  }
}

function askToOpenFile () {
  const properties = [ 'openFile', 'createDirectory' ]
  const filters = [{name: 'Plottr file', extensions: ['pltr']}]
  const files = dialog.showOpenDialogSync({filters: filters, properties: properties })
  if (files && files.length) {
    openWindow(files[0])
  }
}

function gracefullyNotSave () {
  dialog.showErrorBox(i18n('Saving failed'), i18n("Saving your file didn't work. Try again."))
}

const askToOpenOrCreate =  preventsQuitting(() => {
  const choice = dialog.showMessageBoxSync({type: 'question', buttons: [i18n('New from Template'), i18n('New File'), i18n('Open File')], message: i18n('Would you like to open an existing file or start a new file?')})
  switch (choice) {
    case 0:
      openDashboardWindow()
      break
    case 1:
      askToCreateFile()
      break
    case 2:
      askToOpenFile()
      break
  }
})

function gracefullyQuit () {
  if (!app.isReady() || !windows.length) {
    dialog.showMessageBoxSync({type: 'info', buttons: [i18n('ok')], message: i18n('Plottr ran into a problem. Try opening Plottr again.'), detail: i18n('If you keep seeing this problem, email us at support@getplottr.com')})
    app.quit()
  }
}

function openRecentFiles (fileToOpen) {
  log.info('openRecentFiles. file to open?', fileToOpen)
  // open-file for windows
  if (is.windows && process.argv.length == 2 && NODE_ENV != 'dev') {
    const param = process.argv[1]

    if (param.includes('.pltr')) {
      openWindow(param)
    }

    // handle custom protocol links here for windows
    // const link = param.replace('plottr://')
  } else if (fileToOpen) {
    openWindow(fileToOpen)
    fileToOpen = null
  } else {
    let openFiles = FileManager.listOpenFiles()
    log.info('openRecentFiles. openFiles.length', openFiles.length)
    if (openFiles.length) {
      openFiles.forEach(f => openWindow(f))
    } else {
      // TODO: open a dashboard here instead (or maybe it always gets opened, so no need for this branch of logic)
      askToOpenOrCreate()
    }
  }
}

module.exports = {
  checkUpdatesIfAllowed,
  askToSave,
  askToCreateFile,
  importFromSnowflake,
  askToOpenFile,
  gracefullyNotSave,
  askToOpenOrCreate,
  gracefullyQuit,
  openRecentFiles,
}
