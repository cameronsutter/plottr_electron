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
          cb(null, true)
          break
        case 'word':
        default:
          WordExporter(fullState, fileName, options, notifyUser)
            .then((filePath) => {
              cb(null, filePath)
            })
            .catch((error) => {
              logger.error('error', error)
              cb(error, false)
            })
          return
      }
    } catch (error) {
      logger.error('Failed to export', error)
      cb(error, false)
    }
  } else {
    if (saveDialog) {
      cb(null, false)
    } else {
      cb(new Error('No file name'), false)
    }
  }
}
