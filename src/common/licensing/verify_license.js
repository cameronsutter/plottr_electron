import rp from 'request-promise-native'
import log from 'electron-log'
import {
  licenseURL,
  isActiveLicense,
  licenseIsForProduct,
  hasActivationsLeft,
  PRODUCT_IDS,
  productMapping,
} from './licensing'

// callback(isValid, data)
export function verifyLicense(license, callback) {
  // this is going to fire all 3 requests no matter what
  Promise.allSettled(
    PRODUCT_IDS.map((id) => rp(makeRequest(licenseURL('activate_license', id, license))))
  ).then((results) => {
    // find the product that this key belongs to
    let productForKey = null
    results.some((res, index) => {
      const productID = PRODUCT_IDS[index]
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

function makeRequest(url) {
  return {
    url: url,
    method: 'GET',
    json: true,
  }
}
