import Store from 'electron-store'
import defaultSettings from '../../../shared/default_settings'

const storePath = process.env.NODE_ENV == 'development' ? 'config_dev' : 'config'

const SETTINGS = new Store({defaults: defaultSettings, name: storePath})
export default SETTINGS
