import migrateIfNeeded from '../migrator/migration_manager'
import { emptyFile } from '../store/newFileState'

const fromTemplate = (forLines) => (template, appVersion, projectTitle, callback) => {
  const emptyPlottrFile = emptyFile(projectTitle, appVersion)
  if (forLines) emptyPlottrFile.lines = []
  const version = template.version || guessVersion(template.templateData)
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

export const projectFromTemplate = fromTemplate(false)

export const lineFromTemplate = fromTemplate(true)

/* This function is useful for custom templates created from 2021.2.8
 * backwards because in those versions we didn't attach an version to
 * custom templates.
 *
 * This function was written by inspecting the migrations to figure
 * out what markers there could be for a template to belong to a
 * version.
 *
 * NOTE: custom templates were added to plottr in May 2020.  So we
 * don't need to check very old versions of plottr.  All built-in
 * templates have versions.
 *
 * ALSO NOTE: at the time of writing this, it was only possible to
 * create a custom template with beats, cards, and lines.  We're only
 * interested in migrations which effect those attributes.
 */
export const guessVersion = (partialPlottrFile) => {
  if (
    partialPlottrFile.lines &&
    partialPlottrFile.lines.length &&
    partialPlottrFile.lines[0].expanded === undefined
  ) {
    // 2020.7.7 didn't have the expanded property
    return '2020.7.6'
  } else if (
    (partialPlottrFile.lines &&
      partialPlottrFile.lines.length &&
      partialPlottrFile.lines[0].fromTemplateId === undefined) ||
    (partialPlottrFile.cards &&
      partialPlottrFile.cards.length &&
      partialPlottrFile.cards[0].fromTemplateId === undefined) ||
    (partialPlottrFile.chapters &&
      partialPlottrFile.chapters.length &&
      partialPlottrFile.chapters[0].fromTemplateId === undefined)
  ) {
    // 2020.8.28 didn't have a from template id
    return '2020.8.27'
  } else if (partialPlottrFile.chapters) {
    // 2020.2.8 had chapters rather than beats
    return '2021.2.7'
  }
  // We don't know what version we're working with.  Bail out!
  return null
}
