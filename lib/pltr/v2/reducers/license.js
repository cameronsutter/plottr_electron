import { SET_LICENSE_INFO, SET_TRIAL_INFO, SET_PRO_LICENSE_INFO, RESET_PRO_LICENSE_INFO } from '../constants/ActionTypes'

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
  // TODO: fill with an example object
  proLicenseInfo: {
    expiration: null,
    admin: false,
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
