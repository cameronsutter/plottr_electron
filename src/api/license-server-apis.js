import rp from 'request-promise-native'
import log from 'electron-log'
import { machineIdSync } from 'node-machine-id'

import { getIdTokenResult } from 'wired-up-firebase'

import setupRollbar from '../common/utils/rollbar'
import { fileSystemAPIs } from './'
import { isMacOS } from '../isOS'

const rollbar = setupRollbar('license_checker')

export const trial90days = ['nanoCAMP@90', 'infoSTACK90!']
export const trial60days = ['infoSTACK60!']

export function checkForActiveLicense(licenseInfo, callback) {
  if (!licenseInfo || !Object.keys(licenseInfo).length) {
    callback(null, false)
    return
  }

  const key = licenseInfo.licenseKey
  const itemID = licenseInfo.item_id
  log.info('checking for active license', itemID, key)
  rp(makeRequest(licenseURL('check_license', itemID, key)))
    .then((json) => {
      const activeLicense = isActiveLicense(json)
      log.info('[license_checker]', 'active license?', itemID, activeLicense)
      // TODO: update site_count and/or activations_left locally
      productMapping[`${itemID}`](activeLicense)
      callback(null, activeLicense)
    })
    .catch((err) => {
      log.error(err)
      rollbar.warn(err)
      // conscious choice not to turn premium off here
      // User may be disconnected from internet or something else going on
      log.info('[license_checker]', 'license check request failed')
      callback(err, null)
    })
}

// callback(isValid, data)
export function verifyLicense(license, callback) {
  // this is going to fire all 3 requests no matter what
  Promise.allSettled(
    productIds().map((id) => rp(makeRequest(licenseURL('activate_license', id, license))))
  ).then((results) => {
    // find the product that this key belongs to
    let productForKey = null
    results.some((res, index) => {
      const productID = productIds()[index]
      if (process.env.NODE_ENV === 'development') {
        log.info(productID, res)
      }
      if (res.status == 'fulfilled') {
        const isProductForKey = licenseIsForProduct(res.value)
        if (isProductForKey) productForKey = { productID, value: res.value }
        return isProductForKey
      } else {
        log.info('license check request failed', productID)
        log.error(productID)
        // rollbar.warn(productID, err)
        return false
      }
    })
    if (productForKey) {
      const activeLicense = isActiveLicense(productForKey.value)
      log.info('[verifyRequest]', productForKey.productID, 'active license?', activeLicense)

      // set config vars
      productMapping[productForKey.productID](activeLicense)

      if (activeLicense) {
        const data = {
          licenseKey: license,
          ...productForKey.value,
        }
        callback(true, data)
      } else {
        callback(false, {
          ...productForKey.value,
          problem: productForKey.value.error,
          hasActivationsLeft: hasActivationsLeft(productForKey.value),
        })
      }
    } else {
      // doesn't belong to any product
      callback(false, { problem: 'invalid_item_id' })
    }
  })
}

export const PRO_ID = '104900'

// callback(hasPro, info)
export function checkForPro(email, callback) {
  return rp(makeRequest(subscriptionsURL(email)))
    .then((response) => {
      log.info('successful pro request')
      if (!response.subscriptions) {
        log.info(response)
        callback(false)
        return
      }

      // find the subscription with Pro
      const activeSub = response.subscriptions.find((sub) => {
        return sub.info && isProProduct(sub.info) && isActiveSub(sub.info)
      })
      if (activeSub) {
        const { info } = activeSub
        // TODO: save this info somewhere
        log.info(info.product_id, info.status, info.expiration)
        callback(true, info)
      } else {
        getIdTokenResult()
          .then((token) => {
            if (token?.claims?.beta || token?.claims?.admin || token?.claims?.lifetime) {
              callback(true)
            } else {
              callback(false)
            }
          })
          .catch((error) => {
            callback(false)
          })
      }
    })
    .catch((err) => {
      if (err.message === `No customer found for ${email}!`) {
        callback(false)
        return Promise.resolve(true)
      }
      log.error('Failed to check for pro', err)
      return Promise.reject(err)
    })
}

function isProProduct(info) {
  return info.product_id == PRO_ID
}

function isActiveSub(info) {
  return info.status == 'active'
}

const BASE_URL = 'https://my.plottr.com/edd-api'
const v2OldProductId = () => (isMacOS() ? '11321' : '11322')
// NOTE: if this order changes, change the productMapping array at the bottom too
const productIds = () => [33347, 33345, v2OldProductId()]
const WRONG_PRODUCT_ERRORS = ['invalid_item_id', 'key_mismatch', 'item_name_mismatch', 'missing']

const GRACE_PERIOD_DAYS = 30

const { saveAppSetting } = fileSystemAPIs

function licenseURL(action, productID, license) {
  let url = `${BASE_URL}`
  url += `?edd_action=${action}&item_id=${productID}&license=${license}`
  url += `&url=${machineIdSync(true)}`
  return url
}

function isActiveLicense(body) {
  // license could also be:
  // - site_inactive
  // - invalid
  // - disabled
  // - expired
  // - inactive

  // not handling site_inactive nor inactive differently than invalid for now
  return body.success && body.license == 'valid'
}

function licenseIsForProduct(body) {
  // for some reason if the right product has no activations left,
  // all item ids respond with no_activations_left, so check for that
  if (body.error == 'no_activations_left') return true
  return (
    body.success &&
    !WRONG_PRODUCT_ERRORS.includes(body.error) &&
    !WRONG_PRODUCT_ERRORS.includes(body.license)
  )
}

function hasActivationsLeft(body) {
  return body.activations_left > 0
}

function mapV2old(isActive) {
  if (isActive) {
    saveAppSetting('trialMode', false)
    saveAppSetting('canGetUpdates', true)
    saveAppSetting('isInGracePeriod', false)
    saveAppSetting('canEdit', true)
    saveAppSetting('canExport', true)
  } else {
    saveAppSetting('trialMode', false)
    saveAppSetting('canGetUpdates', false)
    saveAppSetting('isInGracePeriod', false)
    saveAppSetting('canEdit', true)
    saveAppSetting('canExport', true)
  }
}

function mapPro(isActive) {
  const currentAppSettings = fileSystemAPIs.currentAppSettings()

  if (isActive) {
    saveAppSetting('trialMode', false)
    saveAppSetting('canGetUpdates', true)
    saveAppSetting('isInGracePeriod', false)
    saveAppSetting('canEdit', true)
    saveAppSetting('canExport', true)
  } else {
    const timeStamp = Date.now()
    if (currentAppSettings.isInGracePeriod && timeStamp > currentAppSettings.gracePeriodEnd) {
      saveAppSetting('trialMode', false)
      saveAppSetting('canGetUpdates', false)
      saveAppSetting('isInGracePeriod', false)
      saveAppSetting('canEdit', false)
      saveAppSetting('canExport', false)
    } else {
      // just expired
      saveAppSetting('trialMode', false)
      saveAppSetting('canGetUpdates', false)
      saveAppSetting('isInGracePeriod', true)
      saveAppSetting('gracePeriodEnd', currentAppSettings.gracePeriodEnd || getGracePeriodEnd())
      saveAppSetting('canEdit', true)
      saveAppSetting('canExport', true)
    }
  }
}

function getGracePeriodEnd() {
  let result = new Date()
  result.setDate(result.getDate() + GRACE_PERIOD_DAYS)
  result.setHours(23, 59, 59, 999)
  return result.getTime()
}

const productMapping = {
  33347: mapPro,
  33345: mapPro,
  11321: mapV2old,
  11322: mapV2old,
}

// NOTE: only needed for non-license api calls
function apiURL(path = '', params = '') {
  const authParams = `?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}`
  return `${BASE_URL}/${path}/${authParams}&number=-1${params}`
}

function subscriptionsURL(email) {
  return apiURL('subscriptions', `&customer=${email}`)
}

function makeRequest(url) {
  return {
    url: url,
    method: 'GET',
    json: true,
  }
}
