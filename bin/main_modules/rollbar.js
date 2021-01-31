const { app } = require('electron')
const Rollbar = require('rollbar')
const { NODE_ENV, ROLLBAR_ACCESS_TOKEN } = require('./constants')
const { getLicenseInfo } = require('./license_info')

function setupRollbar(where, USER) {
  let environment = NODE_ENV === 'dev' ? 'development' : 'production'
  let rollbarToken = ROLLBAR_ACCESS_TOKEN || ''
  const version = app.getVersion()

  return new Rollbar({
    accessToken: rollbarToken,
    handleUncaughtExceptions: NODE_ENV !== 'dev',
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
}

const USER_INFO = getLicenseInfo()
const rollbar = setupRollbar('main', USER_INFO)

module.exports = {
  setupRollbar,
  rollbar,
}
