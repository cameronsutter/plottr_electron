const { shell, ipcMain } = require('electron')

ipcMain.on('open-buy-window', (event) => {
  openBuyWindow()
})

function openBuyWindow() {
  shell.openExternal('https://plottr.com/pricing/')
}

module.exports = { openBuyWindow }
