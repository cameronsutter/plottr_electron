import { app } from 'electron'
import log from 'electron-log'

import Store from '../lib/store'
import defaultSettings from '../../shared/default_settings'

const storePath = process.env.NODE_ENV == 'development' ? 'config_dev' : 'config'

const SETTINGS = new Store(app.getPath('userData'), log, {
  defaults: defaultSettings,
  name: storePath,
})

export default SETTINGS
