const Store = require('electron-store')
const defaultSettings = require('../../shared/default_settings')
const SETTINGS = new Store({defaults: defaultSettings})

module.exports = SETTINGS