import { t } from 'plottr_locales'

import { makeMainProcessClient } from './app/mainProcessClient'

const { notify, showItemInFolder } = makeMainProcessClient()

export function notifyUser(exportPath, type) {
  const messageForType = {
    word: t('Your Plottr file was exported to a .docx file'),
    scrivener: t('Your Plottr file was exported to a Scrivener project package'),
  }
  notify(t('File Exported'), messageForType[type]).then(() => {
    showItemInFolder(exportPath)
  })
}
