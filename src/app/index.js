import { SETTINGS } from '../file-system/stores'

const electron = require('electron')
const { setupI18n } = require('plottr_locales')
setupI18n(SETTINGS, { electron })
;(() => {
  require('./_index.js')
})()
