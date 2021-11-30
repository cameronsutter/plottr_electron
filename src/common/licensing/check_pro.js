import rp from 'request-promise-native'
import log from 'electron-log'
import { subscriptionsURL, makeRequest } from './licensing'
import { currentUser } from 'wired-up-firebase'

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
        currentUser()
          ?.getIdTokenResult()
          .then((token) => {
            if (token?.claims?.beta || token?.claims?.admin) {
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
