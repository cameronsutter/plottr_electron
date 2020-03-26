const request = require('request')
const log = require('electron-log')
const setupRollbar = require('./rollbar')
const rollbar = setupRollbar('license_checker')
const { machineIdSync } = require('node-machine-id')
const SETTINGS = require('./settings')

const BASE_URL = 'http://plottr.flywheelsites.com'
const PRODUCT_ID = '3090'
const SUBSCRIPTION_ID = '3087'

function checkForActiveLicense (licenseInfo, callback) {
  const req = makeRequest(licenseURL(licenseInfo.licenseKey))
  request(req, (err, response, body) => {
    if (process.env.NODE_ENV === 'dev') {
      console.log(body)
    }
    if (err) {
      log.error(err)
      rollbar.warn(err)
      // conscious choice to allow them to use the app if the verification request fails
      // they might be offline
      // but either way if they have a valid license in user_info
      // i'll give them a one-launch grace
      callback(true)
    } else {
      if (isValidLicense(body)) {
        // check for premium
        getSubscriptionInfo(body.customer_email, (err, activeSub) => {
          if (process.env.NODE_ENV === 'dev') {
            console.log(activeSub)
          }
          SETTINGS.set('premiumFeatures', !err && activeSub)
          callback(true)
        })
      } else {
        callback(false)
      }
    }
  })
}

isValidLicense = (body) => {
  // license could also be:
  // - site_inactive
  // - invalid
  // - disabled?
  // not handling site_inactive differently than invalid for now
  return body.success && body.license == 'valid'
}

function getSubscriptionInfo (email, callback) {
  const req = makeRequest(subscriptionURL(email))
  request(req, (err, response, body) => {
    if (err) callback(err, null)
    else {
      const activeSub = findActiveSubscription(body)
      if (activeSub) {
        callback(null, activeSub)
      } else {
        callback(null, false)
      }
    }
  })
}

function findActiveSubscription (body) {
  if (body.error) return false
  if (!body.subscriptions) return false

  return body.subscriptions.find(sub => {
    return sub.info && sub.info.product_id == SUBSCRIPTION_ID && sub.info.status == "active"
  })
}

function licenseURL (license) {
  let url = apiURL()
  url += `&edd_action=check_license&item_id=${PRODUCT_ID}&license=${license}`
  url += `&url=${machineIdSync(true)}`
  return url
}

function subscriptionURL (email) {
  let url = apiURL('/subscriptions')
  url += `&customer=${email}`
  return url
}

function apiURL (path = '') {
  return `${BASE_URL}/edd-api${path}?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}&number=-1`
}

function makeRequest (url) {
  return {
    url: url,
    method: 'GET',
    json: true,
  }
}

module.exports = checkForActiveLicense