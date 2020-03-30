const Rollbar = require('rollbar')
import { remote } from 'electron'
const app = remote.app

export default function setupRollbar(where) {
  let environment = process.env.NODE_ENV === 'development' ? 'development' : 'production'
  let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''

  return new Rollbar({
    accessToken: rollbarToken,
    handleUncaughtExceptions: process.env.NODE_ENV !== 'development',
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
