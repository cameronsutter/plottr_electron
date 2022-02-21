import {
  RESET_PRO_LICENSE_INFO,
  SET_LICENSE_INFO,
  SET_PRO_LICENSE_INFO,
  SET_TRIAL_INFO,
} from '../constants/ActionTypes'

export const setTrialInfo = (trialInfo) => ({
  type: SET_TRIAL_INFO,
  trialInfo,
})

export const setLicenseInfo = (licenseInfo) => ({
  type: SET_LICENSE_INFO,
  licenseInfo,
})

export const setProLicenseInfo = (proLicenseInfo) => ({
  type: SET_PRO_LICENSE_INFO,
  proLicenseInfo,
})

export const resetProLicenseInfo = () => ({
  type: RESET_PRO_LICENSE_INFO,
})
