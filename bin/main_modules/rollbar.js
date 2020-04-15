const { app } = require('electron')
const Rollbar = require('rollbar')

function setupRollbar(where) {
  let environment = process.env.NODE_ENV === 'dev' ? 'development' : 'production'
  let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
  const version = app.getVersion()

  return new Rollbar({
    accessToken: rollbarToken,
    handleUncaughtExceptions: process.env.NODE_ENV !== 'dev',
    handleUnhandledRejections: true,
    ignoredMessages: [],
    codeVersion: version,
    environment: environment,
    payload: {
      environment: environment,
      version: version,
      where: where,
      os: process.platform
    }
  })
}

module.exports = setupRollbar