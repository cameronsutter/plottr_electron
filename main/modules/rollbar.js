import { app } from 'electron'
import log from 'electron-log'
import Rollbar from 'rollbar'
import { NODE_ENV, ROLLBAR_ACCESS_TOKEN } from './constants'
import { getLicenseInfo } from './license_info'

function setupRollbar(where) {
  return getLicenseInfo()
    .then((USER) => {
      let environment = NODE_ENV === 'development' ? 'development' : 'production'
      let rollbarToken = ROLLBAR_ACCESS_TOKEN || ''
      const version = app.getVersion()

      return new Rollbar({
        accessToken: rollbarToken,
        handleUncaughtExceptions: NODE_ENV !== 'development',
        handleUnhandledRejections: true,
        ignoredMessages: [],
        payload: {
          platform: 'client', // allows the post_client_item token in rollbar
          environment: environment,
          version: version,
          where: where,
          os: process.platform,
          client: {
            javascript: {
              source_map_enabled: true,
              code_version: version,
              guess_uncaught_frames: true,
            },
          },
          person: {
            id: USER && USER.payment_id,
            email: USER && USER.customer_email,
          },
        },
      })
    })
    .catch((error) => {
      log.error('Failed to set up rollbar', error)
    })
}

// Make it a dummy object in case someone tries to access it before
// it's ready.
let rollbar = {
  error: () => {},
}
setupRollbar('main')
  .then((instance) => {
    rollbar = instance
  })
  .catch((error) => {
    log.error('Failed to setup default rollbar instance', error)
  })

export { setupRollbar, rollbar }
