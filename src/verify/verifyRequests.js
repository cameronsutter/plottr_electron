import request from 'request'
import { machineIdSync } from 'node-machine-id'

const BASE_URL = 'http://plottr.flywheelsites.com'
const PRODUCT_ID = '3090'
const SUBSCRIPTION_ID = '3087'

export function getLicenseInfo (license, callback) {
  const req = makeRequest(licenseURL(license))
  request(req, (err, response, body) => {
    if (err) callback(err, false, {})
    else {
      if (isValidLicense(body)) {
        const data = {
          licenseKey: license,
          purchase: body,
        }
        // check for premium
        getSubscriptionInfo(body.customer_email, (err, activeSub) => {
          if (!err && activeSub) {
            data.premium = true
            data.subscription = activeSub
          }
          callback(null, true, data)
        })
      } else {
        callback(null, false, {hasActivationsLeft: hasActivationsLeft(body)})
      }
    }
  })
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

function hasActivationsLeft (body) {
  return body.activations_left > 0
}

function isValidLicense (body) {
  return body.success && body.license == "valid"
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
  url += `&edd_action=activate_license&item_id=${PRODUCT_ID}&license=${license}`
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