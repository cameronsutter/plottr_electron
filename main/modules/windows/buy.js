import { shell } from 'electron'

function openBuyWindow() {
  shell.openExternal('https://plottr.com/pricing/')
}

export { openBuyWindow }
