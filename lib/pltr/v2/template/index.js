import migrateIfNeeded from '../migrator/migration_manager'
import { emptyFile } from '../store/newFileState'

export const projectFromTemplate = (template, appVersion, projectTitle, callback) => {
  const emptyPlottrFile = emptyFile(projectTitle, appVersion)
  migrateIfNeeded(
    appVersion,
    {
      ...template.templateData,
      name: template.name,
      file: {
        version: template.version,
      },
      id: template.id,
    },
    null, // Migrate in memory.  No File needed.
    null, // No backup function because there is no file.
    (error, didMigrate, state) => {
      const mergedWithEmptyFile = Object.assign({}, emptyPlottrFile, state)
      callback(error, mergedWithEmptyFile)
    }
  )
}
