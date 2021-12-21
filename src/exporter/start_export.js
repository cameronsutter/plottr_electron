import { remote } from 'electron'
import { t } from 'plottr_locales'
import MPQ from '../common/utils/MPQ'
import ScrivenerExporter from './scrivener/v2/exporter'
import WordExporter from './word/exporter'

const win = remote.getCurrentWindow()
const { dialog } = remote

export default function askToExport(defaultPath, fullState, type, options, isWindows, cb) {
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
  const fileName = dialog.showSaveDialogSync(win, { title: label, filters, defaultPath })
  if (fileName) {
    MPQ.push('Export', { export_type: type, options: options })

    try {
      switch (type) {
        case 'scrivener':
          ScrivenerExporter(fullState, fileName, options, isWindows)
          break
        case 'word':
        default:
          WordExporter(fullState, fileName, options)
          break
      }
      cb(null, true)
    } catch (error) {
      cb(error, false)
    }
  } else {
    cb(null, false)
  }
}
