import { SET_LICENSE_INFO, SET_TRIAL_INFO } from '../constants/ActionTypes'

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
    default: {
      return state
    }
  }
}

export default licenseReducer
