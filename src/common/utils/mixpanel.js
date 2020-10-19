import mixpanel from 'mixpanel-browser'
import USER from './user_info'

export default function initMixpanel () {
  // only use mixpanel for paid users, not free trial users
  if (USER.get('payment_id')) {
    mixpanel.init('507cb4c0ee35b3bde61db304462e9351')
    mixpanel.identify(USER.get('payment_id').toString())
  }
}