const Rollbar = require('rollbar')
import { remote } from 'electron'
const app = remote.app
import USER from './user_info'

export default function setupRollbar(where) {
  let environment = process.env.NODE_ENV == 'development' ? 'development' : 'production'
  let rollbarToken = process.env.ROLLBAR_ACCESS_TOKEN || ''
  let version = app.getVersion()

  return new Rollbar({
    accessToken: rollbarToken,
    handleUncaughtExceptions: process.env.NODE_ENV != 'development',
    handleUnhandledRejections: true,
    ignoredMessages: [],
    payload: {
      environment: environment,
      version: version,
      os: process.platform,
      context: where,
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
      },
      server: {
        root: `https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/main/${version}/`
      },
    },
    transform: function (payload) {
      payload.request.url = requestURL(payload.request.url, version)
      payload.body.trace.frames = payload.body.trace.frames.map(fr => {
        fr.filename = requestURL(fr.filename, version)
        return fr
      })
    },
    checkIgnore: function (isUncaught, args, payload) {
      // return true to ignore
      return process.env.NODE_ENV == 'development'
    },
  })
}

function requestURL (url, version) {
  const baseURL = `https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/main/${version}`
  if (url.includes('app.html') || url.includes('app.bundle.js')) return `${baseURL}/app.bundle.js`
  if (url.includes('dashboard.html') || url.includes('dashboard.bundle.js')) return `${baseURL}/dashboard.bundle.js`
  if (url.includes('expired.html') || url.includes('expired.bundle.js')) return `${baseURL}/expired.bundle.js`
  if (url.includes('verify.html') || url.includes('verify.bundle.js')) return `${baseURL}/verify.bundle.js`
  return `${baseURL}/commons.bundle.js`
}
