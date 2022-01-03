import { PropTypes } from 'prop-types'
import { assertPropTypes } from 'plottr_check-prop-types'

import publishChangesToStore from './publish'
import current from './current'

// What could come from cloud versus local?  Should I model them as
// separate sources according to the world?
export const theWorldAccordingToPlottr = {
  license: PropTypes.shape({
    listenToTrialChanges: PropTypes.func.isRequired,
    currentTrial: PropTypes.func.isRequired,
    listenToLicenseChanges: PropTypes.func.isRequired,
    currentLicense: PropTypes.func.isRequired,
  }).isRequired,
  session: PropTypes.shape({
    listenForSessionChange: PropTypes.func.isRequired,
  }).isRequired,
  files: PropTypes.shape({
    listenToknownFilesChanges: PropTypes.func.isRequired,
    currentKnownFiles: PropTypes.func.isRequired,
  }).isRequired,
  backups: PropTypes.shape({
    listenToBackupsChanges: PropTypes.func.isRequired,
    currentBackups: PropTypes.func.isRequired,
  }).isRequired,
  templates: PropTypes.shape({
    listenToTemplatesChanges: PropTypes.func.isRequired,
    currentTemplates: PropTypes.func.isRequired,
    listenToCustomTemplatesChanges: PropTypes.func.isRequired,
    currentCustomTemplates: PropTypes.func.isRequired,
    listenToTemplateManifestChanges: PropTypes.func.isRequired,
    currentTemplateManifest: PropTypes.func.isRequired,
  }).isRequired,
  settings: PropTypes.shape({
    listenToExportConfigSettingsChanges: PropTypes.func.isRequired,
    currentExportConfigSettings: PropTypes.func.isRequired,
    listenToAppSettingsChanges: PropTypes.func.isRequired,
    currentAppSettings: PropTypes.func.isRequired,
    listenToUserSettingsChanges: PropTypes.func.isRequired,
    currentUserSettings: PropTypes.func.isRequired,
  }).isRequired,
}

export const worldAPIShape = {
  publishChangesToStore: PropTypes.func.isRequired,
  license: PropTypes.shape({
    currentLicense: PropTypes.func.isRequired,
    currentTrial: PropTypes.func.isRequired,
  }).isRequired,
  files: PropTypes.shape({
    currentlyKnownFiles: PropTypes.func.isRequired,
  }).isRequired,
  backups: PropTypes.shape({
    currentBackups: PropTypes.func.isRequired,
  }).isRequired,
  templates: PropTypes.shape({
    currentTemplates: PropTypes.func.isRequired,
    currentCustomTemplates: PropTypes.func.isRequired,
    currentTemplateManifest: PropTypes.func.isRequired,
  }).isRequired,
  settings: PropTypes.shape({
    currentAppSettings: PropTypes.func.isRequired,
    currentUserSettings: PropTypes.func.isRequired,
    currentExportConfigSettings: PropTypes.func.isRequired,
  }).isRequired,
}

export const plottrWorldAPI = (theWorld) => {
  assertPropTypes(theWorldAccordingToPlottr, theWorld, 'plottr-world', 'theWorld', () => {
    const error = new Error()
    return error.stack
  })

  const {
    license: { currentLicense, currentTrial },
    files: { currentlyKnownFiles },
    backups: { currentBackups },
    templates: { currentTemplates, currentCustomTemplates, currentTemplateManifest },
    settings: { currentAppSettings, currentUserSettings, currentExportConfigSettings },
  } = current(theWorld)

  const api = {
    publishChangesToStore: publishChangesToStore(theWorld),
    license: {
      currentLicense,
      currentTrial,
    },
    files: {
      currentlyKnownFiles,
    },
    backups: {
      currentBackups,
    },
    templates: {
      currentTemplates,
      currentCustomTemplates,
      currentTemplateManifest,
    },
    settings: {
      currentAppSettings,
      currentUserSettings,
      currentExportConfigSettings,
    },
  }

  assertPropTypes(worldAPIShape, api, 'plottr-world-api', 'api', () => {
    const error = new Error()
    return error.stack
  })

  return api
}
