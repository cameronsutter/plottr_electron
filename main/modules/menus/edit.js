import { t } from 'plottr_locales'
import { is } from 'electron-util'

function buildEditMenu() {
  return {
    label: t('Edit'),
    submenu: [
      {
        label: t('Undo'),
        accelerator: 'CmdOrCtrl+Z',
        click: (event, focusedWindow) => {
          focusedWindow.webContents.send('undo')
        },
      },
      {
        label: t('Redo'),
        accelerator: is.macos ? 'Cmd+Shift+Z' : 'Ctrl+Y',
        click: (event, focusedWindow) => {
          focusedWindow.webContents.send('redo')
        },
      },
      {
        type: 'separator',
      },
      {
        label: t('Cut'),
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: t('Copy'),
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: t('Paste'),
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: t('Paste and Match Style'),
        accelerator: 'CmdOrCtrl+Shift+V',
        role: 'pasteAndMatchStyle',
      },
      {
        label: t('Select All'),
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall',
      },
    ],
  }
}

export { buildEditMenu }
