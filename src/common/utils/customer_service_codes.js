import path from 'path'
import { shell, remote } from 'electron'
const { app, dialog } = remote
import storage from 'electron-json-storage'
import log from 'electron-log'
import { BACKUP_BASE_PATH, CUSTOM_TEMPLATES_PATH } from './config_paths'
import SETTINGS from './settings'
import { extendTrialWithReset } from '../licensing/trial_manager'
import { USER_INFO_PATH } from './config_paths'
import { manifestStore } from './store_hooks'

// generate with `Math.random().toString(16)`
export function handleCustomerServiceCode(code) {
  switch (code) {
    case 'xsu7wb':
      // extend free trial (one time)
      extendTrialWithReset(30)
      break

    case '941ff8':
      // view backups
      shell.openPath(BACKUP_BASE_PATH)
      break

    case '7c6a3a':
      // turn off backup
      SETTINGS.set('backup', false)
      break

    case 'dbfd51':
      // turn on backup
      SETTINGS.set('backup', true)
      break

    case '3c66c9':
      // turn off allowPrerelease
      SETTINGS.set('allowPrerelease', false)
      break

    case 'a56a8a':
      // turn on allowPrerelease
      SETTINGS.set('allowPrerelease', true)
      break

    case 'f92d59':
      // turn off canGetUpdates
      SETTINGS.set('canGetUpdates', false)
      break

    case 'd45e13cf92d59':
      // turn on canGetUpdates
      SETTINGS.set('canGetUpdates', true)
      break

    case '186e0d':
      // turn on diagnose update problems
      SETTINGS.set('diagnoseUpdate', true)
      break

    case 'd0e681':
      // turn off diagnose update problems
      SETTINGS.set('diagnoseUpdate', false)
      break

    case '329fd4391c10d':
      // nuke the license info
      storage.remove(USER_INFO_PATH, (error) => {
        if (error) log.warn(error)
      })
      break

    case '16329e':
      // show the custom templates file
      shell.showItemInFolder(path.join(app.getPath('userData'), `${CUSTOM_TEMPLATES_PATH}.json`))
      break

    case '8bb9de':
      // open the Plottr internal User Data folder
      shell.openPath(app.getPath('userData'))
      break

    case 'templates version':
      dialog.showMessageBox({
        title: 'Templates Version',
        type: 'info',
        message: manifestStore.get('manifest.version'),
        detail: 'Templates Version',
      })
      break

    default:
      break
  }
}
