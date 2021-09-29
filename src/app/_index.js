import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { t } from 'plottr_locales'
import App from 'containers/App'
import { store } from 'store/configureStore'
import { ipcRenderer, remote } from 'electron'
import { is } from 'electron-util'
import electron from 'electron'
const { app, dialog } = remote
const win = remote.getCurrentWindow()
import { actions, migrateIfNeeded, featureFlags, emptyFile } from 'pltr/v2'
import { initialFetch, overwriteAllKeys, withFileId } from 'plottr_firebase'
import MPQ from '../common/utils/MPQ'
import setupRollbar from '../common/utils/rollbar'
import initMixpanel from '../common/utils/mixpanel'
import log from 'electron-log'
import SETTINGS from '../common/utils/settings'
import askToExport from '../common/exporter/start_export'
import { ActionCreators } from 'redux-undo'
import { setupI18n } from 'plottr_locales'
import { displayFileName } from '../common/utils/known_files'
import { addNewCustomTemplate } from '../common/utils/custom_templates'
import { dispatchingToStore, makeFlagConsistent } from './makeFlagConsistent'
import exportConfig from '../common/exporter/default_config'
import { TEMP_FILES_PATH } from '../common/utils/config_paths'
import { createErrorReport } from '../common/utils/full_error_report'
import TemplateFetcher from '../dashboard/utils/template_fetcher'
import { machineIdSync } from 'node-machine-id'
import Listener from './components/listener'

const clientId = machineIdSync()

setupI18n(SETTINGS, { electron })

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const rollbar = setupRollbar('app.html')

process.on('uncaughtException', (err) => {
  log.error(err)
  rollbar.error(err)
})

// Secondary SETUP //
window.requestIdleCallback(() => {
  ipcRenderer.send('ensure-backup-full-path')
  ipcRenderer.send('ensure-backup-today-path')
  TemplateFetcher.fetch()
  initMixpanel()
})

const root = document.getElementById('react-root')
// TODO: fix this by exporting store from the configureStore file
// kind of a hack to enable store dispatches in otherwise hard situations
window.specialDelivery = (action) => {
  store.dispatch(action)
}

ipcRenderer.on('state-saved', (_arg) => {
  // store.dispatch(fileSaved())
})

const isPlottrCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

function bootFile(filePath, options, numOpenFiles) {
  win.setTitle(displayFileName(filePath))
  win.setRepresentedFilename(filePath)

  const { darkMode, beatHierarchy } = options
  const isCloudFile = isPlottrCloudFile(filePath)

  try {
    if (isCloudFile) {
      const fileId = filePath.split('plottr://')[1]
      const userId = SETTINGS.get('user.id')
      const emailAddress = SETTINGS.get('user.email')
      if (!userId) {
        rollbar.error(`Tried to boot plottr cloud file (${filePath}) without a user id.`)
        return
      }

      initialFetch(userId, fileId, clientId, app.getVersion()).then((json) => {
        migrateIfNeeded(
          app.getVersion(),
          json,
          json.file.fileName,
          null,
          (error, migrated, data) => {
            if (error) {
              rollbar.error(error)
              return
            }
            console.log(`Loaded file ${json.file.fileName}.`)
            if (migrated) {
              console.log(
                `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
              )
            }
            overwriteAllKeys(fileId, clientId, data).then((results) => {
              store.dispatch(
                actions.ui.loadFile(
                  data.file.fileName,
                  false,
                  Object.assign(
                    {},
                    emptyFile(data.file.fileName, data.file.version),
                    withFileId(fileId, data)
                  ),
                  data.file.version
                )
              )
              store.dispatch(actions.project.selectFile(json.file))
              store.dispatch(actions.client.setClientId(clientId))
              store.dispatch(actions.client.setEmailAddress(emailAddress))
            })
            render(
              <Provider store={store}>
                <Listener />
                <App />
              </Provider>,
              root
            )
          }
        )
      })
    } else {
      let json
      try {
        json = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      } catch (error) {
        return render(
          <Provider store={store}>
            <App forceProjectDashboard />
          </Provider>,
          root
        )
      }
      ipcRenderer.send('save-backup', filePath, json)
      migrateIfNeeded(app.getVersion(), json, filePath, null, (err, didMigrate, state) => {
        if (err) {
          rollbar.error(err)
          log.error(err)
        }
        store.dispatch(actions.ui.loadFile(filePath, didMigrate, state, state.file.version))

        MPQ.projectEventStats(
          'open_file',
          { online: navigator.onLine, version: state.file.version, number_open: numOpenFiles },
          state
        )

        if (state.ui && state.ui.darkMode !== darkMode) {
          store.dispatch(actions.ui.setDarkMode(darkMode))
        }
        if (darkMode) window.document.body.className = 'darkmode'

        const withDispatch = dispatchingToStore(store.dispatch)
        makeFlagConsistent(
          state,
          beatHierarchy,
          featureFlags.BEAT_HIERARCHY_FLAG,
          withDispatch(actions.featureFlags.setBeatHierarchy),
          withDispatch(actions.featureFlags.unsetBeatHierarchy)
        )

        if (state && state.tour && state.tour.showTour)
          store.dispatch(actions.ui.changeOrientation('horizontal'))

        render(
          <Provider store={store}>
            <App />
          </Provider>,
          root
        )
      })
    }
  } catch (error) {
    // TODO: error dialog and ask the user to try again
    log.error(error)
    rollbar.error(error)
  }
}

ipcRenderer.send('pls-fetch-state', win.id)
ipcRenderer.on('state-fetched', (event, filePath, options, numOpenFiles) => {
  bootFile(filePath, options, numOpenFiles)
})

ipcRenderer.on('reload-from-file', (event, filePath, options, numOpenFiles) => {
  bootFile(filePath, options, numOpenFiles)
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
    is.windows,
    (error, success) => {
      if (error) {
        log.error(error)
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
    win.setTitle(displayFileName(newFilePath))
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
  log.error(err)
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
  const settingsWeCareAbout = {
    auto_download: SETTINGS.get('user.autoDownloadUpdate'),
    backup_on: SETTINGS.get('backup'),
    locale: SETTINGS.get('locale'),
    dark: SETTINGS.get('user.dark'),
  }
  MPQ.push('Launch', { online: navigator.onLine, version: version, ...settingsWeCareAbout })
})

ipcRenderer.on('reload', () => {
  location.reload()
})

ipcRenderer.on('create-error-report', () => {
  createErrorReport()
})

ipcRenderer.on('auto-save-error', (event, filePath, error) => {
  log.warn(error)
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
  log.warn('[save state backup]', error)
  rollbar.error({ message: 'BACKUP failed' })
  rollbar.warn(error, { fileName: filePath })
})

ipcRenderer.on('save-backup-error', (event, error, filePath) => {
  log.warn('[file open backup]', error)
  rollbar.error({ message: 'BACKUP failed' })
  rollbar.warn(error, { fileName: filePath })
})

ipcRenderer.on('save-backup-success', (event, filePath) => {
  log.info('[file open backup]', 'success', filePath)
})
