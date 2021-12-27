import { is } from 'electron-util'
import { machineIdSync } from 'node-machine-id'
import { fileSystemAPIs } from '../../api'

const BASE_URL = 'https://my.plottr.com/edd-api'
const V2_OLD_PRODUCT_ID = is.macos ? '11321' : '11322'
// NOTE: if this order changes, change the productMapping array at the bottom too
export const PRODUCT_IDS = [33347, 33345, V2_OLD_PRODUCT_ID]
export const WRONG_PRODUCT_ERRORS = [
  'invalid_item_id',
  'key_mismatch',
  'item_name_mismatch',
  'missing',
]

const GRACE_PERIOD_DAYS = 30

const { saveAppSetting } = fileSystemAPIs

export function licenseURL(action, productID, license) {
  let url = `${BASE_URL}`
  url += `?edd_action=${action}&item_id=${productID}&license=${license}`
  url += `&url=${machineIdSync(true)}`
  return url
}

export function isActiveLicense(body) {
  // license could also be:
  // - site_inactive
  // - invalid
  // - disabled
  // - expired
  // - inactive

  // not handling site_inactive nor inactive differently than invalid for now
  return body.success && body.license == 'valid'
}

export function licenseIsForProduct(body) {
  // for some reason if the right product has no activations left,
  // all item ids respond with no_activations_left, so check for that
  if (body.error == 'no_activations_left') return true
  return (
    body.success &&
    !WRONG_PRODUCT_ERRORS.includes(body.error) &&
    !WRONG_PRODUCT_ERRORS.includes(body.license)
  )
}

export function hasActivationsLeft(body) {
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

export const productMapping = {
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

export function subscriptionsURL(email) {
  return apiURL('subscriptions', `&customer=${email}`)
}

export function makeRequest(url) {
  return {
    url: url,
    method: 'GET',
    json: true,
  }
}
