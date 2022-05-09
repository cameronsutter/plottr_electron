import Rollbar from 'rollbar'

export default function setupRollbar(
  where,
  appVersion,
  userSettings,
  environment,
  rollbarToken,
  os
) {
  return new Promise((resolve, reject) => {
    window.requestIdleCallback(() => {
      try {
        resolve(
          new Rollbar({
            accessToken: rollbarToken,
            handleUncaughtExceptions: environment !== 'development',
            handleUnhandledRejections: true,
            ignoredMessages: [],
            payload: {
              environment: environment,
              version: appVersion,
              os,
              context: where,
              client: {
                javascript: {
                  source_map_enabled: true,
                  code_version: appVersion,
                  guess_uncaught_frames: true,
                },
              },
              person: {
                id: userSettings.get('payment_id'),
                email: userSettings.get('customer_email'),
              },
              server: {
                root: `https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/main/${appVersion}/`,
              },
            },
            transform: function (payload) {
              payload.request.url = requestURL(payload.request.url, appVersion)
              payload.body.trace.frames = payload.body.trace.frames.map((fr) => {
                fr.filename = requestURL(fr.filename, appVersion)
                return fr
              })
            },
            checkIgnore: function (isUncaught, args, payload) {
              // return true to ignore
              return environment == 'development'
            },
          })
        )
      } catch (error) {
        reject(error)
      }
    })
  })
}

function requestURL(url, version) {
  const baseURL = `https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/main/${version}`
  if (url.includes('app.html') || url.includes('app.bundle.js')) return `${baseURL}/app.bundle.js`
  if (url.includes('dashboard.html') || url.includes('dashboard.bundle.js'))
    return `${baseURL}/dashboard.bundle.js`
  if (url.includes('expired.html') || url.includes('expired.bundle.js'))
    return `${baseURL}/expired.bundle.js`
  if (url.includes('verify.html') || url.includes('verify.bundle.js'))
    return `${baseURL}/verify.bundle.js`
  return `${baseURL}/commons.bundle.js`
}
