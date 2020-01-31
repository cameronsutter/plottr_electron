const { app } = require('electron')
const Rollbar = require('rollbar')
let environment = process.env.NODE_ENV === 'dev' ? 'development' : 'production'
let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''

function setupRollbar(where) {
  return new Rollbar({
    accessToken: rollbarToken,
    handleUncaughtExceptions: process.env.NODE_ENV !== 'dev',
    handleUnhandledRejections: true,
    ignoredMessages: [],
    payload: {
      environment: environment,
      version: app.getVersion(),
      where: where,
      os: process.platform
    }
  })
}

module.exports = setupRollbar