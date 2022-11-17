import { t } from 'plottr_locales'

import { makeMainProcessClient } from './app/mainProcessClient'

const { showSaveDialog } = makeMainProcessClient()

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
  return showSaveDialog(label, filters, defaultPath)
}
