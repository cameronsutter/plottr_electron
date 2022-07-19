import mixpanel from 'mixpanel-browser'

import { whenClientIsReady } from '../../../shared/socket-client/index'
import makeFileSystemAPIs from '../../api/file-system-apis'

export default function initMixpanel() {
  const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)
  if (mixpanel.__loaded) return
  // only use mixpanel for paid users, not free trial users
  fileSystemAPIs.currentUserSettings().then((user) => {
    if (user.payment_id && process.env.NODE_ENV != 'development') {
      mixpanel.init('507cb4c0ee35b3bde61db304462e9351')
      mixpanel.identify(user.payment_id.toString())
    }
  })
}
