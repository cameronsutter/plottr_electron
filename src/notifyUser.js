import { t } from 'plottr_locales'
import { ipcRenderer, shell } from 'electron'

export function notifyUser(exportPath, type) {
  const messageForType = {
    word: t('Your Plottr file was exported to a .docx file'),
    scrivener: t('Your Plottr file was exported to a Scrivener project package'),
  }
  ipcRenderer.send('notify', t('File Exported'), messageForType[type])
  shell.showItemInFolder(exportPath)
}
