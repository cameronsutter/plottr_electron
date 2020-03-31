const Store = require('electron-store')
const { OPEN_FILES_PATH } = require('./config_paths')
const SETTINGS = require('./settings')

const manifestStore = new Store({name: OPEN_FILES_PATH})

class WindowManager {

}

const WM = new WindowManager()

module.exports = WM