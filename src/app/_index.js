import path from 'path'
import { store } from 'store'
import { ipcRenderer } from 'electron'
import { dialog } from '@electron/remote'
import electron from 'electron'

import { actions, SYSTEM_REDUCER_KEYS } from 'pltr/v2'
import { setupI18n, t } from 'plottr_locales'
import world from 'world-api'

import MPQ from '../common/utils/MPQ'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import askToExport from '../exporter/start_export'
import exportConfig from '../exporter/default_config'
import { ActionCreators } from 'redux-undo'
import { displayFileName } from '../common/utils/known_files'
import { addNewCustomTemplate } from '../common/utils/custom_templates'
import { TEMP_FILES_PATH } from '../file-system/config_paths'
import { createFullErrorReport } from '../common/utils/full_error_report'
import TemplateFetcher from '../common/utils/template_fetcher'
import {
  openDashboard,
  closeDashboard,
  createBlankProj,
  createFromTemplate,
  openExistingProj,
} from '../dashboard-events'
import { logger } from '../logger'
import { fileSystemAPIs } from '../api'
import { renderFile } from '../renderFile'
import { isWindows } from '../isOS'

setupI18n(fileSystemAPIs.currentAppSettings(), { electron })

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const rollbar = setupRollbar('app.html')

process.on('uncaughtException', (err) => {
  logger.error(err)
  rollbar.error(err)
})

// Secondary SETUP //
window.requestIdleCallback(() => {
  ipcRenderer.send('ensure-backup-full-path')
  ipcRenderer.send('ensure-backup-today-path')
  TemplateFetcher.fetch()
  initMixpanel()
})

// TODO: fix this by exporting store from the configureStore file
// kind of a hack to enable store dispatches in otherwise hard situations
window.specialDelivery = (action) => {
  store.dispatch(action)
}

ipcRenderer.on('state-saved', (_arg) => {
  // store.dispatch(fileSaved())
})

ipcRenderer.on('set-dark-mode', (event, isOn) => {
  store.dispatch(actions.ui.setDarkMode(isOn))
  window.document.body.className = isOn ? 'darkmode' : ''
})

ipcRenderer.on('set-beat-hierarchy', (event) => {
  store.dispatch(actions.featureFlags.setBeatHierarchy())
})

ipcRenderer.on('unset-beat-hierarchy', (event) => {
  store.dispatch(actions.featureFlags.unsetBeatHierarchy())
})

ipcRenderer.on('save-custom-template', (event, options) => {
  const currentState = store.getState()
  addNewCustomTemplate(currentState.present, options)
})

ipcRenderer.on('export-file-from-menu', (event, { type }) => {
  const currentState = store.getState()
  const {
    ui,
    series: { name },
    books,
  } = currentState.present
  const bookId = ui.currentTimeline
  const defaultPath =
    bookId == 'series' ? name + ' ' + t('(Series View)') : books[`${bookId}`].title

  askToExport(
    defaultPath,
    currentState.present,
    type,
    exportConfig[type],
    isWindows(),
    (error, success) => {
      if (error) {
        logger.error(error)
        dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        return
      }
    }
  )
})

ipcRenderer.on('save', () => {
  const { present } = store.getState()
  ipcRenderer.send('save-file', present.file.fileName, present)
})

ipcRenderer.on('save-as', () => {
  const { present } = store.getState()
  const defaultPath = path.basename(present.file.fileName).replace('.pltr', '')
  const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
  const fileName = dialog.showSaveDialogSync(win, {
    filters,
    title: t('Where would you like to save this copy?'),
    defaultPath,
  })
  if (fileName) {
    let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
    ipcRenderer.send('save-file', newFilePath, present)
    ipcRenderer.send('pls-open-window', newFilePath, true)
  }
})

const ensureEndsInPltr = (filePath) => {
  if (!filePath.endsWith('.pltr')) {
    return `${filePath}.pltr`
  }
  return filePath
}

ipcRenderer.on('move-from-temp', () => {
  const { present } = store.getState()
  if (!present.file.fileName.includes(TEMP_FILES_PATH)) {
    ipcRenderer.send('save-file', present.file.fileName, present)
    return
  }
  const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
  const newFilePath = ensureEndsInPltr(
    dialog.showSaveDialogSync(win, {
      filters: filters,
      title: t('Where would you like to save this file?'),
    })
  )
  if (newFilePath) {
    // change in redux
    store.dispatch(actions.ui.editFileName(newFilePath))
    // remove from tmp store
    ipcRenderer.send('remove-from-temp-files-if-temp', present.file.fileName)
    // update in known files
    ipcRenderer.send('edit-known-file-path', present.file.fileName, newFilePath)
    // change the window's title
    win.setRepresentedFilename(newFilePath)
    win.filePath = newFilePath
    win.setTitle(displayFileName(newFilePath, false))
    // send event to dashboard
    ipcRenderer.send('pls-tell-dashboard-to-reload-recents')
  }
})

ipcRenderer.on('undo', (event) => {
  store.dispatch(ActionCreators.undo())
})

ipcRenderer.on('redo', (event) => {
  store.dispatch(ActionCreators.redo())
})

ipcRenderer.on('acts-tour-start', (event) => {
  store.dispatch(actions.tour.setTourFeature({ name: 'acts', id: 1, endStep: 8 }))
})

window.onerror = function (message, file, line, column, err) {
  logger.error(err)
  rollbar.error(err)
}

window.SCROLLWITHKEYS = true
document.addEventListener('keydown', (e) => {
  if (window.SCROLLWITHKEYS) {
    const table = document.querySelector('.sticky-table')
    if (table) {
      if (e.key === 'ArrowUp') {
        let amount = 300
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollTop -= amount
      } else if (e.key === 'ArrowRight') {
        let amount = 400
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollLeft += amount
      } else if (e.key === 'ArrowDown') {
        let amount = 300
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollTop += amount
      } else if (e.key === 'ArrowLeft') {
        let amount = 400
        if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
        table.scrollLeft -= amount
      }
    }
  }
})

window.logger = function (which) {
  process.env.LOGGER = which.toString()
}

ipcRenderer.once('send-launch', (event, version) => {
  const settings = fileSystemAPIs.currentAppSettings()
  const settingsWeCareAbout = {
    auto_download: settings.user?.autoDownloadUpdate,
    backup_on: settings.backup,
    locale: settings.locale,
    dark: settings.user?.dark,
  }
  MPQ.push('Launch', { online: navigator.onLine, version: version, ...settingsWeCareAbout })
})

ipcRenderer.on('create-error-report', () => {
  createFullErrorReport()
})

ipcRenderer.on('auto-save-error', (event, filePath, error) => {
  logger.warn(error)
  rollbar.warn(error, { fileName: filePath })
  dialog.showErrorBox(
    t('Auto-saving failed'),
    t("Saving your file didn't work. Check where it's stored.")
  )
})

ipcRenderer.on('auto-save-worked-this-time', (event, filePath) => {
  dialog.showMessageBox(win, {
    title: t('Auto-saving worked'),
    message: t('Saving worked this time 🎉'),
  })
})

ipcRenderer.on('auto-save-backup-error', (event, filePath, error) => {
  logger.warn('[save state backup]', error)
  rollbar.error({ message: 'BACKUP failed' })
  rollbar.warn(error, { fileName: filePath })
})

ipcRenderer.on('save-backup-error', (event, error, filePath) => {
  logger.warn('[file open backup]', error)
  rollbar.error({ message: 'BACKUP failed' })
  rollbar.warn(error, { fileName: filePath })
})

ipcRenderer.on('save-backup-success', (event, filePath) => {
  logger.info('[file open backup]', 'success', filePath)
})

ipcRenderer.on('close-dashboard', () => {
  closeDashboard()
})

const reloadMenu = () => ipcRenderer.send('pls-reload-menu')
window.addEventListener('load', reloadMenu)
window.addEventListener('focus', reloadMenu)

ipcRenderer.on('new-project', () => createBlankProj())
ipcRenderer.on('open-existing', () => openExistingProj())
ipcRenderer.on('from-template', () => {
  openDashboard()
  setTimeout(createFromTemplate, 300)
})

// TODO: not sure when/whether we should unsubscribe.  Presumably
// when the window is refreshed/closed?
//
// Could be important to do so because it might set up inotify
// listeners and too many of those cause slow-downs.
const unsubscribeToPublishers = world.publishChangesToStore(store)

const root = document.getElementById('react-root')

renderFile(root)
