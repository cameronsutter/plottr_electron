import { PropTypes } from 'prop-types'
import { assertPropTypes } from 'plottr_check-prop-types'

import publishFilesChanges from './files'
import puiblishLicenseChanges from './license'
import puiblishSettingsChanges from './settings'
import publishTemplatesChanges from './templates'
import publishBackupsChanges from './backups'

export const storeAccordingToPlottr = {
  dispatch: PropTypes.func.isRequired,
}

const connectListenersToStore = (theWorld) => (store) => {
  assertPropTypes(storeAccordingToPlottr, store, 'plottr-world', 'theWorld', () => {
    const error = new Error()
    return error.stack
  })

  const unsubscribeFromFilesChanges = publishFilesChanges(theWorld)(store)
  const unsubscribeFromLicenseChanges = puiblishLicenseChanges(theWorld)(store)
  const unsubscribeFromSettingsChanges = puiblishSettingsChanges(theWorld)(store)
  const unsubscribeFromTemplatesChanges = publishTemplatesChanges(theWorld)(store)
  const unsubscribeFromBackupsChanges = publishBackupsChanges(theWorld)(store)

  return () => {
    unsubscribeFromFilesChanges()
    unsubscribeFromLicenseChanges()
    unsubscribeFromSettingsChanges()
    unsubscribeFromTemplatesChanges()
    unsubscribeFromBackupsChanges()
  }
}

export default connectListenersToStore
