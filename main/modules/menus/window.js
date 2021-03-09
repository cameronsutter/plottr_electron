const i18n = require('plottr_locales').t

function buildWindowMenu() {
  return {
    label: i18n('Window'),
    role: 'windowMenu',
  }
}

module.exports = { buildWindowMenu }
