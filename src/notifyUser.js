import { t } from 'plottr_locales'
import { shell } from 'electron'
import { Notification } from '@electron/remote'

export function notifyUser(exportPath, type) {
  const messageForType = {
    word: t('Your Plottr file was exported to a .docx file'),
    scrivener: t('Your Plottr file was exported to a Scrivener project package'),
  }
  try {
    const notification = new Notification({
      title: t('File Exported'),
      body: messageForType[type],
      silent: true,
    })
    notification.show()
    setTimeout(() => {
      notification.close()
    }, 5000)
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
  shell.showItemInFolder(exportPath)
}
