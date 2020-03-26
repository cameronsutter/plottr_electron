import Store from 'electron-store'
import defaultSettings from '../../../shared/default_settings'

const SETTINGS = new Store({defaults: defaultSettings})
export default SETTINGS