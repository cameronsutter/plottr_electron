const Store = require('electron-store')
const defaultSettings = require('../../shared/default_settings')
const storePath = process.env.NODE_ENV == 'dev' ? 'config_dev' : 'config'
const SETTINGS = new Store({defaults: defaultSettings, name: storePath})

module.exports = SETTINGS

// TODO: refactor this so it's only in one place
// it also lives:
// - shared/licensing.js
// - src/common/utils
