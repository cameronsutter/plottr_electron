const Store = require('electron-store')
const defaultSettings = require('../../shared/default_settings')
const storePath = process.env.NODE_ENV == 'development' ? 'config_dev' : 'config'

const SETTINGS = new Store({defaults: defaultSettings, name: storePath})
module.exports = SETTINGS