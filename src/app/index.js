import SETTINGS from '../common/utils/settings'

const electron = require('electron')
const { setupI18n } = require('plottr_locales')
setupI18n(SETTINGS, { electron })
;(() => {
  require('./_index.js')
})()
