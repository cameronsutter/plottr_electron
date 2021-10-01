import rp from 'request-promise-native'
import log from 'electron-log'
import setupRollbar from '../utils/rollbar'
const rollbar = setupRollbar('license_checker')
import { licenseURL, isActiveLicense, productMapping, makeRequest } from './licensing'

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
