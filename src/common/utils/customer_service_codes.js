import { shell } from 'electron'
import storage from 'electron-json-storage'
import log from 'electron-log'
import { RECENT_FILES_PATH, BACKUP_BASE_PATH } from './config_paths'
import SETTINGS from './settings'
import { extendTrialWithReset } from '../licensing/trial_manager'
import { USER_INFO_PATH } from './config_paths'

// generate with `Math.random().toString(16)`
export function handleCustomerServiceCode(code) {
  switch (code) {
    case 'xsu7wb':
      // extend free trial (one time)
      extendTrialWithReset(30)
      break

    case 'bafa09':
      // delete recentFiles file
      storage.remove(RECENT_FILES_PATH, (error) => {
        if (error) log.warn(error)
      })
      break

    case '941ff8':
      // view backups
      shell.openItem(BACKUP_BASE_PATH)
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

    default:
      break
  }
}
