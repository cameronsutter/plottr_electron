import { Menu, ipcMain, BrowserWindow } from 'electron'
import log from 'electron-log'

import { buildPlottrMenu } from './plottr'
import { buildEditMenu } from './edit'
import { buildWindowMenu } from './window'
import { buildHelpMenu } from './help'
import { buildFileMenu } from './file'
import { buildViewMenu } from './view'
import { getWindowById } from '../windows'
import { whenClientIsReady } from '../../../shared/socket-client/index'

let safelyExitModule = null

ipcMain.on('pls-reload-menu', () => {
  log.info('Menu reload requested.')
  if (!safelyExitModule) {
    log.error('Requesting a menu reload, but we have not built them before.')
    return
  }
  loadMenu(safelyExitModule)
    .catch((error) => {
      log.error('Error reloading menu', error)
    })
    .then(() => {
      log.info('Reloaded menu')
    })
})

function buildMenu(safelyExit) {
  safelyExitModule = safelyExit
  const win = BrowserWindow.getFocusedWindow()
  let filePath = null
  if (win) {
    const winObj = getWindowById(win.id)
    if (winObj) {
      filePath = winObj.filePath
    }
  }

  const getTrialInfo = () =>
    whenClientIsReady(({ currentTrial }) => {
      return currentTrial()
    })

  return Promise.all([
    buildPlottrMenu(buildMenu, safelyExit),
    buildFileMenu(filePath, getTrialInfo),
  ]).then(([plottrMenu, fileMenu]) => {
    return [
      plottrMenu,
      fileMenu,
      buildEditMenu(),
      buildViewMenu(),
      buildWindowMenu(),
      buildHelpMenu(),
    ]
  })
}

function loadMenu(safelyExit) {
  return buildMenu(safelyExit).then((template) => {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  })
}

export { loadMenu }
