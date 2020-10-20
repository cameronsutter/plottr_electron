const { app } = require('electron')
const Rollbar = require('rollbar')

function setupRollbar(where, USER) {
  let environment = process.env.NODE_ENV === 'dev' ? 'development' : 'production'
  let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
  const version = app.getVersion()

  return new Rollbar({
    accessToken: rollbarToken,
    handleUncaughtExceptions: process.env.NODE_ENV !== 'dev',
    handleUnhandledRejections: true,
    ignoredMessages: [],
    payload: {
      environment: environment,
      version: version,
      where: where,
      os: process.platform,
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: version,
          guess_uncaught_frames: true,
        }
      },
      person: {
        id: USER && USER.payment_id,
        email: USER && USER.customer_email,
      }
    },
  })
}

module.exports = setupRollbar