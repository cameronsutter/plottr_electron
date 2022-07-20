import { app } from 'electron'
import log from 'electron-log'

import Store from '../lib/store'

const licenseStore = new Store(app.getPath('userData'), log, { name: 'license_info', watch: true })

function getLicenseInfo() {
  return licenseStore.get()
}

export { getLicenseInfo }
