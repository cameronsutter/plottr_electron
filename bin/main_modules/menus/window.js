const i18n = require('format-message');

function buildWindowMenu () {
  return {
    label: i18n('Window'),
    role: 'windowMenu',
  }
}

module.exports = { buildWindowMenu };
