const request = require('request')
const log = require('electron-log')
const setupRollbar = require('./rollbar')
const rollbar = setupRollbar('license_checker')
const { machineIdSync } = require('node-machine-id')

function checkForActiveLicense (licenseKey, callback) {
  const req = makeRequest(licenseKey)

  request(req, function (err, response, body) {
    if (err) {
      log.error(err)
      rollbar.warn(err)
      callback(false)
    } else {
      if (process.env.NODE_ENV === 'dev') {
        console.log(body)
      }
      if (isValidLicense(body)) {
        callback(true)
      } else {
        callback(false)
      }
    }
  })
}

isValidLicense = (body) => {
  return body.success && body.license === "valid"
}

buildURL = (license) => {
  const itemId = "355"
  // itemId = "737" // for premium features
  let url = 'http://plottr.flywheelsites.com'
  url += `/edd-api?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}&number=-1`
  url += `&edd_action=check_license&item_id=${itemId}&license=${license}`
  url += `&url=${machineIdSync(true)}`
  return url
}

makeRequest = (license) => {
  return {
    url: buildURL(license),
    method: 'GET',
    json: true,
  }
}

module.exports = checkForActiveLicense
