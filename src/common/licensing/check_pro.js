import rp from 'request-promise-native'
import log from 'electron-log'
import { subscriptionsURL, makeRequest } from './licensing'

export const PRO_ID = '104900'

// callback(hasPro, info)
export function checkForPro(email, callback) {
  rp(makeRequest(subscriptionsURL(email)))
    .then((response) => {
      log.info('successfull pro request')
      if (!response.subscriptions) {
        log.info(response)
        return callback(false)
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
        callback(false)
      }
    })
    .catch((err) => {
      log.error(err)
    })
}

function isProProduct(info) {
  return info.product_id == PRO_ID
}

function isActiveSub(info) {
  return info.status == 'active'
}
