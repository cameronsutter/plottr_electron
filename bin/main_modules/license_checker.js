const request = require('request')
const log = require('electron-log')
const setupRollbar = require('./rollbar')
const rollbar = setupRollbar('license_checker')
const { machineIdSync } = require('node-machine-id')
const SETTINGS = require('./settings')
const { is } = require('electron-util')

const BASE_URL = 'http://getplottr.com'
const PRODUCT_ID = is.macos ? '11321' : '11322'
// const SUBSCRIPTION_ID = '10333'

function checkForActiveLicense (licenseInfo, callback) {
  const key = licenseInfo.purchase ? licenseInfo.purchase.license_key : licenseInfo.licenseKey
  log.info('checking for active license', key)
  const req = makeRequest(licenseURL(key))
  request(req, (err, response, body) => {
    if (process.env.NODE_ENV === 'dev') {
      console.log(body)
    }
    if (err) {
      log.error(err)
      rollbar.warn(err)
      // conscious choice not to turn premium off here
      // User may be disconnected from internet or something else going on
      log.info('license check request failed')
      callback(false)
    } else {
      const activeLicense = !!isActiveLicense(body)
      log.info('active license?', activeLicense)
      SETTINGS.set('premiumFeatures', activeLicense)
      // TODO: update site_count and/or activations_left locally
      callback(activeLicense)
    }
  })
}

isActiveLicense = (body) => {
  // license could also be:
  // - site_inactive
  // - invalid
  // - disabled
  // - expired
  // - inactive

  // not handling site_inactive nor inactive differently than invalid for now
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

// function findActiveSubscription (body) {
//   if (body.error) return false
//   if (!body.subscriptions) return false

//   return body.subscriptions.find(sub => {
//     return sub.info && sub.info.product_id == SUBSCRIPTION_ID && sub.info.status == "active"
//   })
// }

function licenseURL (license) {
  let url = `${BASE_URL}/`
  url += `?edd_action=check_license&item_id=${PRODUCT_ID}&license=${license}`
  url += `&url=${machineIdSync(true)}`
  return url
}

// function subscriptionURL (email) {
//   let url = apiURL('/subscriptions')
//   url += `&customer=${email}`
//   return url
// }

// NOTE: only needed for non-license api calls
// function apiURL (path = '') {
//   return `${BASE_URL}/edd-api${path}?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}&number=-1`
// }

function makeRequest (url) {
  return {
    url: url,
    method: 'GET',
    json: true,
  }
}

module.exports = checkForActiveLicense