import migrateIfNeeded from '../migrator/migration_manager'
import { emptyFile } from '../store/newFileState'

export const projectFromTemplate = (template, appVersion, projectTitle, callback) => {
  const emptyPlottrFile = emptyFile(projectTitle, appVersion)
  const version = template.version || guessVersion(template)
  if (!version) {
    callback(new Error(`Couldn't determine version of template: ${template.name}`))
    return
  }
  migrateIfNeeded(
    appVersion,
    {
      ...template.templateData,
      name: template.name,
      file: { version },
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

/* This function is useful for custom templates created 2021.2.8 and
 * before plottr because in those versions we did not attach an
 * version to custom templates.
 *
 * This function was written by inspecting the migrations to figure
 * out what markers there could be for a template to belong to a
 * version.
 */
export const guessVersion = (template) => {
  
}
