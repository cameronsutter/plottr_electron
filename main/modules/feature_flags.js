import log from 'electron-log'

import currentSettings from './settings'

const featureFlags = () => {
  return currentSettings()
    .then((settings) => {
      return {
        beatHierarchy: settings.user.beatHierarchy,
      }
    })
    .catch((error) => {
      log.error('Could not read current settings when trying to get beatHierarchy', error)
      return Promise.reject(error)
    })
}

export { featureFlags }
