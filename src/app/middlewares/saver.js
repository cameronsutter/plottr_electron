import fs from 'fs'
import { remote } from 'electron'
import { t as i18n } from 'plottr_locales'
import log from 'electron-log'
import { saveBackup } from '../../common/utils/backup'
import { ActionTypes } from 'pltr/v2'

const { FILE_SAVED, FILE_LOADED, SET_DARK_MODE } = ActionTypes

const dialog = remote.dialog
const win = remote.getCurrentWindow()

const BLACKLIST = [FILE_SAVED, FILE_LOADED, SET_DARK_MODE]
let itWorkedLastTime = true

const saver = (store) => (next) => (action) => {
  const result = next(action)
  if (BLACKLIST.includes(action.type)) return result
  const state = store.getState().present
  // save and backup
  saveFile(state.file.fileName, state)
  return result
}

function saveFile(filePath, jsonData) {
  let stringData = ''
  if (process.env.NODE_ENV == 'development') {
    stringData = JSON.stringify(jsonData, null, 2)
  } else {
    stringData = JSON.stringify(jsonData)
  }
  fs.writeFile(filePath, stringData, (saveErr) => {
    // either way, save a backup
    saveBackup(filePath, jsonData, (backupErr) => {
      if (backupErr) {
        log.warn('[save state backup]', backupErr)
        rollbar.error({ message: 'BACKUP failed' })
        rollbar.warn(backupErr, { fileName: filePath })
      }
    })
    if (saveErr) {
      log.warn(saveErr)
      rollbar.warn(saveErr, { fileName: filePath })
      itWorkedLastTime = false
      dialog.showErrorBox(
        i18n('Auto-saving failed'),
        i18n("Saving your file didn't work. Check where it's stored.")
      )
    } else {
      // didn't work last time, but it did this time
      if (!itWorkedLastTime) {
        itWorkedLastTime = true
        dialog.showMessageBox(win, {
          title: i18n('Auto-saving worked'),
          message: i18n('Saving worked this time 🎉'),
        })
      }
    }
  })
}

export default saver
