import { t } from 'plottr_locales'
import { shell } from 'electron'

export function notifyUser(exportPath, type) {
  const messageForType = {
    word: t('Your Plottr file was exported to a .docx file'),
    scrivener: t('Your Plottr file was exported to a Scrivener project package'),
  }
  try {
    new Notification(t('File Exported'), { body: messageForType[type], silent: true })
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
  shell.showItemInFolder(exportPath)
}
