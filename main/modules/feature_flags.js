import log from 'electron-log'

import currentSettings from './settings'

const featureFlags = () => {
  return currentSettings()
    .then((settings) => {
      return {}
    })
    .catch((error) => {
      log.error('Could not read current settings for feature flags', error)
      return Promise.reject(error)
    })
}

export { featureFlags }
