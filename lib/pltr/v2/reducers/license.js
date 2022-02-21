import {
  SET_LICENSE_INFO,
  SET_TRIAL_INFO,
  SET_PRO_LICENSE_INFO,
  RESET_PRO_LICENSE_INFO,
} from '../constants/ActionTypes'

/** Example pro license info:
 * {
 *   "id": "9999",
 *   "customer_id": "999",
 *   "period": "year",
 *   "initial_amount": "0.00",
 *   "initial_tax_rate": "",
 *   "initial_tax": "",
 *   "recurring_amount": "0.00",
 *   "recurring_tax_rate": "",
 *   "recurring_tax": "",
 *   "bill_times": "0",
 *   "transaction_id": "",
 *   "parent_payment_id": "99999",
 *   "product_id": "104900", <- NOTE: this is the "Pro" product id.
 *   "price_id": "2",
 *   "created": "2021-09-30 07:43:21",
 *   "expiration": "2022-09-30 23:59:59",
 *   "trial_period": "",
 *   "status": "active",
 *   "profile_id": "999",
 *   "gateway": "manual",
 *   "customer": {
 *     "id": "999",
 *     "purchase_count": 1,
 *     "purchase_value": 0,
 *     "email": "emailaddress@email.com",
 *     "emails": [
 *       "emailaddress@email.com"
 *     ],
 *     "name": "John Doe",
 *     "date_created": "2020-02-28 00:41:27",
 *     "payment_ids": "9999,99999",
 *     "user_id": "999"
 *   },
 *   "notes": ""
 * }
 */
const INITIAL_STATE = {
  trialInfo: {
    startsAt: null,
    endsAt: null,
    extensions: null,
  },
  licenseInfo: {
    expires: null,
    item_name: null,
    customer_email: null,
    licenseKey: null,
    item_id: null,
    activations_left: null,
    site_count: null,
    license: null,
  },
  proLicenseInfo: {
    expiration: null,
    admin: false,
    id: null,
    customer_id: null,
    period: null,
    initial_amount: null,
    initial_tax_rate: null,
    initial_tax: null,
    recurring_amount: null,
    recurring_tax_rate: null,
    recurring_tax: null,
    bill_times: null,
    transaction_id: null,
    parent_payment_id: null,
    product_id: null,
    price_id: null,
    created: null,
    trial_period: null,
    status: null,
    profile_id: null,
    gateway: null,
    customer: {
      id: null,
      purchase_count: null,
      purchase_value: null,
      email: null,
      emails: [],
      name: null,
      date_created: null,
      payment_ids: null,
      user_id: null,
    },
    notes: '',
  },
}

const licenseReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_TRIAL_INFO: {
      return {
        ...state,
        trialInfo: action.trialInfo,
      }
    }
    case SET_LICENSE_INFO: {
      return {
        ...state,
        licenseInfo: action.licenseInfo,
      }
    }
    case SET_PRO_LICENSE_INFO: {
      return {
        ...state,
        proLicenseInfo: action.proLicenseInfo,
      }
    }
    case RESET_PRO_LICENSE_INFO: {
      return {
        ...state,
        proLicenseInfo: INITIAL_STATE.proLicenseInfo,
      }
    }
    default: {
      return state
    }
  }
}

export default licenseReducer
