const i18n = require('format-message')
const { is } = require('electron-util')

function buildEditMenu () {
  return {
    label: i18n('Edit'),
    submenu: [{
      label: i18n('Undo'),
      accelerator: 'CmdOrCtrl+Z',
      click: (event, focusedWindow) => {
        focusedWindow.webContents.send('undo')
      }
    }, {
      label: i18n('Redo'),
      accelerator: is.macos ? 'Cmd+Shift+Z' : 'Ctrl+Y',
      click: (event, focusedWindow) => {
        focusedWindow.webContents.send('redo')
      }
    }, {
      type: 'separator'
    }, {
      label: i18n('Cut'),
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: i18n('Copy'),
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: i18n('Paste'),
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: i18n('Paste and Match Style'),
      accelerator: 'CmdOrCtrl+Shift+V',
      role: 'pasteAndMatchStyle',
    }, {
      label: i18n('Select All'),
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  }
}

module.exports = { buildEditMenu }
