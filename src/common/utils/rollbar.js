const Rollbar = require('rollbar')
import { remote } from 'electron'
const app = remote.app
import USER from './user_info'

export default function setupRollbar(where) {
  let environment = process.env.NODE_ENV === 'development' ? 'development' : 'production'
  let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
  let version = app.getVersion()

  return new Rollbar({
    accessToken: rollbarToken,
    handleUncaughtExceptions: process.env.NODE_ENV !== 'development',
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
        id: USER.get('payment_id'),
        email: USER.get('customer_email'),
      }
    }
  })
}
