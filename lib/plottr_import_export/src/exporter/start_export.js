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
  rm,
  userId,
  downloadStorageImage,
  writeFile,
  join,
  stat,
  mkdir,
  basename,
  cb
) {
  const fileNamePromise = saveDialog ? saveDialog(defaultPath) : Promise.resolve(defaultPath)
  fileNamePromise.then((fileName) => {
    console.log('In exporter...')
    if (fileName) {
      console.log('MPQ event about to be logged...')
      mpq.push('Export', { export_type: type, options: options })

      try {
        switch (type) {
          case 'scrivener': {
            ScrivenerExporter(
              fullState,
              fileName,
              options,
              isWindows,
              notifyUser,
              logger,
              rm,
              join,
              writeFile,
              stat,
              mkdir,
              basename
            )
              .then(() => {
                cb(null, true)
              })
              .catch((error) => {
                cb(error, false)
              })
            break
          }
          case 'word':
          default:
            console.log('About to export to word...')
            WordExporter(
              fullState,
              fileName,
              options,
              notifyUser,
              userId,
              downloadStorageImage,
              writeFile
            )
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
  })
}
