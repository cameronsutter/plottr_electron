import mixpanel from 'mixpanel-browser'
import USER from './user_info'
import { machineIdSync } from 'node-machine-id'

export default function initMixpanel () {
  mixpanel.init('507cb4c0ee35b3bde61db304462e9351')
  if (USER.get('payment_id')) {
    mixpanel.identify(USER.get('payment_id').toString())
  } else {
    mixpanel.identify(machineIdSync(true))
  }
}