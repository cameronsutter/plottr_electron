import { SET_TRIAL_INFO } from '../constants/ActionTypes'

const INITIAL_STATE = {
  trialInfo: {
    startsAt: null,
    endsAt: null,
    extensions: null,
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
    default: {
      return state
    }
  }
}

export default licenseReducer
