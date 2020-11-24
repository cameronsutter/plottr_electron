const Store = require('electron-store')
const rp = require('request-promise-native')
const log = require('electron-log')
const { USER_INFO_PATH } = require('./config_paths')
const { licenseURL, isActiveLicense, productMapping } = require('../../shared/licensing')

const licenseStore = new Store({name: USER_INFO_PATH})

function getLicenseInfo () {
  return licenseStore.get()
}

function checkForActiveLicense (callback) {
  const licenseInfo = licenseStore.get()
  log.info('checkForActiveLicense')
  if (!licenseInfo || !licenseStore.size) {
    log.info('checkForActiveLicense !licenseInfo')
    callback(false)
    return
  }

  const key = licenseInfo.licenseKey
  const itemID = licenseInfo.item_id
  log.info('checking for active license', itemID, key)
  rp(makeRequest(licenseURL('check_license', itemID, key)))
  .then(json => {
    const activeLicense = isActiveLicense(json)
    log.info('[license_checker]', 'active license?', itemID, activeLicense)
    // TODO: update site_count and/or activations_left locally
    productMapping[`${itemID}`](activeLicense)
    callback(activeLicense)
  })
  .catch(err => {
    // we do the require here to avoid circular dependencies
    const rollbar = require('./rollbar').setupRollbar('license_checker');
    log.error(err)
    rollbar.warn(err)
    // conscious choice not to turn premium off here
    // User may be disconnected from internet or something else going on
    log.info('license check request failed')
    callback(false)
  })
}

function makeRequest (url) {
  return {
    url: url,
    method: 'GET',
    json: true,
  }
}

module.exports = { checkForActiveLicense, getLicenseInfo }
