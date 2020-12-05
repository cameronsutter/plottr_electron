const { Menu, app } = require('electron');
const i18n = require('format-message');
const { is } = require('electron-util');
const createErrorReport = require('../error_report')
const { askToCreateFile } = require('../utils');
const { getLicenseInfo } = require('../license_info')
const { windows } = require('../windows');

const { buildPlottrMenu } = require('./plottr');
const { buildEditMenu } = require('./edit');
const { buildWindowMenu } = require('./window');
const { buildHelpMenu } = require('./help');
const { buildFileMenu } = require('./file');
const { buildViewMenu } = require('./view');

function buildMenu (makeItSimple) {
  if (makeItSimple) {
    return [
      buildPlottrMenu(),
      buildEditMenu(),
      buildWindowMenu(),
      buildHelpMenu()
    ]
  }

  return [
    buildPlottrMenu(),
    buildFileMenu(),
    buildEditMenu(),
    buildViewMenu(),
    buildWindowMenu(),
    buildHelpMenu()
  ]
}

function loadMenu (makeItSimple) {
  const template = buildMenu(makeItSimple)
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  if (is.macos) {
    const dockMenu = Menu.buildFromTemplate([
      {label: i18n('Create a new file'), click: function () {
        askToCreateFile()
      }},
      {label: i18n('Create an error report'), click: () => {
        createErrorReport(getLicenseInfo(), windows.map(w => w.state))
      }},
    ])
    app.dock.setMenu(dockMenu)
  }
}

module.exports = {
  buildMenu,
  loadMenu,
};
