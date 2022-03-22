import ScrivenerExporter from './scrivener/v2/exporter'
import WordExporter from './word/exporter'

export default function askToExport(
  defaultPath,
  fullState,
  type,
  options,
  isWindows,
  notifyUser,
  logger,
  saveDialog,
  mpq,
  cb
) {
  const fileName = saveDialog ? saveDialog(defaultPath, type) : defaultPath
  if (fileName) {
    mpq.push('Export', { export_type: type, options: options })

    try {
      switch (type) {
        case 'scrivener':
          ScrivenerExporter(fullState, fileName, options, isWindows, notifyUser, logger)
          break
        case 'word':
        default:
          WordExporter(fullState, fileName, options, notifyUser)
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
