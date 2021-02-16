import migrateIfNeeded from '../migrator/migration_manager'
import { emptyFile } from '../store/newFileState'

export const projectFromTemplate = (templateData, appVersion, projectTitle, callback) => {
  const emptyPlottrFile = emptyFile(projectTitle, appVersion)
  migrateIfNeeded(
    appVersion,
    {
      ...templateData,
      file: {
        version: templateData.version,
      },
    },
    null, // Migrate in memory.  No File needed.
    null, // No backup function because there is no file.
    (error, didMigrate, state) => {
      const mergedWithEmptyFile = Object.assign({}, emptyPlottrFile, state)
      callback(error, mergedWithEmptyFile)
    }
  )
}

export const applyTemplateToEntities = (
  attributeName,
  templateData,
  plottrFile,
  appVersion,
  callback
) => {
  return plottrFile
} // PlottrFile

export const appendTemplateEntities = (
  attributeNames,
  templateData,
  plottrFile,
  appVersion,
  callback
) => {
  return plottrFile
} // PlottrFile
