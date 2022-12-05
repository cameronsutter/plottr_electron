import { makeFileSystemAPIs } from '../../api'
import { whenClientIsReady } from '../../../shared/socket-client'
import { makeMainProcessClient } from '../../app/mainProcessClient'

const { userDataPath, showMessageBox, openPath, showItemInFolder } = makeMainProcessClient()

// generate with `Math.random().toString(16)`
export function handleCustomerServiceCode(code) {
  const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)
  const { saveAppSetting } = fileSystemAPIs

  switch (code) {
    case 'xsu7wb':
      // extend free trial (one time)
      fileSystemAPIs.extendTrialWithReset(30)
      break

    case '941ff8':
      // view backups
      fileSystemAPIs.backupBasePath().then((basePath) => {
        openPath(basePath)
      })
      break

    case '7c6a3a':
      // turn off backup
      saveAppSetting('backup', false)
      break

    case 'dbfd51':
      // turn on backup
      saveAppSetting('backup', true)
      break

    case '3c66c9':
      // turn off allowPrerelease
      saveAppSetting('allowPrerelease', false)
      saveAppSetting('betatemplates', false)
      break

    case 'a56a8a':
      // turn on allowPrerelease
      saveAppSetting('allowPrerelease', true)
      saveAppSetting('betatemplates', true)
      break

    case 'f92d59':
      // turn off canGetUpdates
      saveAppSetting('canGetUpdates', false)
      break

    case 'd45e13cf92d59':
      // turn on canGetUpdates
      saveAppSetting('canGetUpdates', true)
      break

    case '186e0d':
      // turn on diagnose update problems
      saveAppSetting('diagnoseUpdate', true)
      break

    case 'd0e681':
      // turn off diagnose update problems
      saveAppSetting('diagnoseUpdate', false)
      break

    case '329fd4391c10d':
      // nuke the license info
      fileSystemAPIs.deleteLicense()
      break

    case '16329e':
      // show the custom templates file
      fileSystemAPIs.customTemplatesPath().then((path) => {
        return showItemInFolder(path)
      })
      break

    case '8bb9de':
      // open the Plottr internal User Data folder
      userDataPath().then((userData) => {
        return openPath(userData)
      })
      break

    case 'templates version':
      fileSystemAPIs.currentTemplateManifest().then((manifest) => {
        return showMessageBox(
          'Templates Version',
          manifest.manifest.version,
          'info',
          'Templates Version'
        )
      })
      break

    case 'beta templates':
      saveAppSetting('betatemplates', true)
      break

    case 'beta templates off':
      saveAppSetting('betatemplates', false)
      break

    default:
      break
  }
}
