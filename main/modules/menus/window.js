const { t } = require('plottr_locales')

function buildWindowMenu() {
  return {
    label: t('Window'),
    role: 'windowMenu',
  }
}

module.exports = { buildWindowMenu }
