const { is } = require('electron-util')
const { machineIdSync } = require('node-machine-id')
// TODO: refactor this so it's only in one place
const Store = require('electron-store')
const defaultSettings = require('./default_settings')
const storePath = process.env.NODE_ENV == 'dev' ? 'config_dev' : 'config'
const SETTINGS = new Store({defaults: defaultSettings, name: storePath})

const BASE_URL = 'http://getplottr.com'
const V2_OLD_PRODUCT_ID = is.macos ? '11321' : '11322'
const PRODUCT_IDS = [33345, V2_OLD_PRODUCT_ID, 33347] // NOTE: if this order changes, change the productMapping array at the bottom too
const WRONG_PRODUCT_ERRORS = ['invalid_item_id', 'key_mismatch', 'item_name_mismatch', 'missing']

const GRACE_PERIOD_DAYS = 30
const BEGINNING_2021 = 1609484400000

function licenseURL (action, productID, license) {
  let url = `${BASE_URL}/`
  url += `?edd_action=${action}&item_id=${productID}&license=${license}`
  url += `&url=${machineIdSync(true)}`
  return url
}

function isActiveLicense (body) {
  // license could also be:
  // - site_inactive
  // - invalid
  // - disabled
  // - expired
  // - inactive

  // not handling site_inactive nor inactive differently than invalid for now
  return body.success && body.license == 'valid'
}

function licenseIsForProduct (body) {
  return body.success && !WRONG_PRODUCT_ERRORS.includes(body.error) && !WRONG_PRODUCT_ERRORS.includes(body.license)
}

function hasActivationsLeft (body) {
  return body.activations_left && body.activations_left > 0
}

function mapV2old (isActive) {
  if (isActive) {
    SETTINGS.set('isTrial', false)
    SETTINGS.set('canGetUpdates', true)
    SETTINGS.set('isInGracePeriod', false)
    SETTINGS.set('canEdit', true)
    SETTINGS.set('canExport', true)
  } else {
    SETTINGS.set('isTrial', false)
    SETTINGS.set('canGetUpdates', false)
    SETTINGS.set('isInGracePeriod', false)
    SETTINGS.set('canEdit', true)
    SETTINGS.set('canExport', true)
  }
}

function mapPro (isActive) {
  if (isActive) {
    SETTINGS.set('isTrial', false)
    SETTINGS.set('canGetUpdates', true)
    SETTINGS.set('isInGracePeriod', false)
    SETTINGS.set('canEdit', true)
    SETTINGS.set('canExport', true)
  } else {
    const timeStamp = Date.now()
    if (SETTINGS.get('isInGracePeriod') && timeStamp > SETTINGS.get('gracePeriodEnd')) {
      SETTINGS.set('isTrial', false)
      SETTINGS.set('canGetUpdates', false)
      SETTINGS.set('isInGracePeriod', false)
      SETTINGS.set('canEdit', false)
      SETTINGS.set('canExport', false)
    } else {
      // just expired
      SETTINGS.set('isTrial', false)
      SETTINGS.set('canGetUpdates', false)
      SETTINGS.set('isInGracePeriod', true)
      SETTINGS.set('gracePeriodEnd', SETTINGS.get('gracePeriodEnd') || getGracePeriodEnd())
      SETTINGS.set('canEdit', true)
      SETTINGS.set('canExport', true)
    }
  }
}

function map2020 (isActive) {
  const timeStamp = Date.now()
  if (timeStamp < BEGINNING_2021) {
    SETTINGS.set('isTrial', false)
    SETTINGS.set('canGetUpdates', true)
    SETTINGS.set('isInGracePeriod', false)
    SETTINGS.set('canEdit', true)
    SETTINGS.set('canExport', true)
  } else {
    SETTINGS.set('isTrial', false)
    SETTINGS.set('canGetUpdates', false)
    SETTINGS.set('isInGracePeriod', false)
    SETTINGS.set('canEdit', true)
    SETTINGS.set('canExport', true)
  }
}

function getGracePeriodEnd () {
  let result = new Date()
  result.setDate(result.getDate() + GRACE_PERIOD_DAYS)
  result.setHours(23, 59, 59, 999)
  return result.getTime()
}

const productMapping = {
  '33345': mapPro,
  '11321': mapV2old,
  '11322': mapV2old,
  '33347': map2020,
}

module.exports = { licenseURL, isActiveLicense, licenseIsForProduct, hasActivationsLeft, productMapping, PRODUCT_IDS, WRONG_PRODUCT_ERRORS }

// NOTE: only needed for non-license api calls
// function apiURL (path = '') {
//   return `${BASE_URL}/edd-api${path}?key=${process.env.EDD_KEY}&token=${process.env.EDD_TOKEN}&number=-1`
// }
