import { app } from 'electron'
import log from 'electron-log'

import Store from '../lib/store'

const trialStore = new Store(app.getPath('userData'), log, { name: 'trial_info', watch: true })

function getTriaInfo() {
  return Promise.resolve(trialStore.get())
}

export { getTriaInfo }
