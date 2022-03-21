import { getCurrentWindow, dialog } from '@electron/remote'

import { t } from 'plottr_locales'

const win = getCurrentWindow()

export const exportSaveDialog = (defaultPath, type) => {
  let label = t('Where would you like to save the export?')
  let filters = []
  switch (type) {
    case 'word':
      filters = [{ name: t('MS Word'), extensions: ['docx'] }]
      break
    case 'scrivener':
      filters = [{ name: t('Scrivener Project'), extensions: ['scriv'] }]
      break
  }
  return dialog.showSaveDialogSync(win, { title: label, filters, defaultPath })
}
