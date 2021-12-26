import { SET_LICENSE_INFO, SET_TRIAL_INFO } from '../constants/ActionTypes'

export const setTrialInfo = (trialInfo) => ({
  type: SET_TRIAL_INFO,
  trialInfo,
})

export const setLicenseInfo = (licenseInfo) => ({
  type: SET_LICENSE_INFO,
  licenseInfo,
})
