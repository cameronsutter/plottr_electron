import t from 'format-message'
import { shell } from 'electron'

const messageForType = {
  word: t('Your Plottr file was exported to a .docx file'),
  scrivener: t('Your Plottr file was exported to a Scrivener project package'),
}

export function notifyUser(exportPath, type) {
  try {
    new Notification(t('File Exported'), { body: messageForType[type], silent: true })
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
  shell.showItemInFolder(exportPath)
}
