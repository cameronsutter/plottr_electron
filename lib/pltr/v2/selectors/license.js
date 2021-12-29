import { createSelector } from 'reselect'

import { hasProSelector } from './client'

export const trialInfoSelector = (state) => state.license.trialInfo
export const trialEndSelector = (trialInfoSelector, ({ endsAt }) => endsAt)
export const daysLeftOfTrialSelector = createSelector(trialEndSelector, (endsAt) => {
  let oneDay = 24 * 60 * 60 * 1000
  var today = new Date()
  return Math.round((endsAt - today.getTime()) / oneDay)
})
export const trialExpiredSelector = createSelector(
  daysLeftOfTrialSelector,
  (daysLeft) => daysLeft <= 0
)
export const canExtendSelector = createSelector(
  trialInfoSelector,
  ({ extensions }) => extensions > 0
)
export const trialStartedSelector = createSelector(
  trialInfoSelector,
  ({ startsAt, endsAt, extensions }) => {
    return startsAt === null || endsAt === null || extensions === null
  }
)
export const trialStartedOnSelector = createSelector(trialInfoSelector, ({ startsAt }) => startsAt)
export const trialEndsOnSelector = createSelector(trialInfoSelector, ({ endsAt }) => endsAt)

export const licenseInfoSelector = (state) => state.license.licenseInfo
export const licenseExpiresSelector = createSelector(licenseInfoSelector, ({ expires }) => expires)
export const licenseItemNameSelector = createSelector(licenseInfoSelector, ({ item_name }) =>
  item_name?.replace('&#8211;', '-')
)
export const licenseCustomerEmailSelector = createSelector(
  licenseInfoSelector,
  ({ customer_email }) => customer_email
)
export const licenseKeySelector = createSelector(
  licenseInfoSelector,
  ({ licenseKey }) => licenseKey
)
export const itemIdSelector = createSelector(licenseInfoSelector, ({ item_id }) => item_id)
export const activationsLeftSelector = createSelector(
  licenseInfoSelector,
  ({ activations_left }) => activations_left
)
export const siteCountSelector = createSelector(licenseInfoSelector, ({ site_count }) => site_count)
export const licenseLicenseSelector = createSelector(licenseInfoSelector, ({ license }) => license)
export const hasLicenseSelector = createSelector(
  licenseExpiresSelector,
  licenseItemNameSelector,
  licenseCustomerEmailSelector,
  licenseKeySelector,
  (expires, itemName, customerEmail, licenseKey) => {
    return expires === null || itemName === null || customerEmail === null || licenseKey === null
  }
)

// More complicated logic
export const isInTrialModeSelector = createSelector(
  trialStartedSelector,
  trialExpiredSelector,
  hasLicenseSelector,
  hasProSelector,
  (started, trialExpired, hasLicense, hasCurrentProLicense) => {
    return started && !trialExpired && !hasLicense && !hasCurrentProLicense
  }
)
export const isInTrialModeWithExpiredTrialSelector = createSelector(
  trialExpiredSelector,
  hasLicenseSelector,
  hasProSelector,
  (trialExpired, hasLicense, hasCurrentProLicense) => {
    return trialExpired && !hasLicense && !hasCurrentProLicense
  }
)
export const isFirstTimeSelector = createSelector(
  hasLicenseSelector,
  trialExpiredSelector,
  hasProSelector,
  (hasLicense, trialStarted, hasCurrentProLicense) => {
    return !hasLicense && !trialStarted && !hasCurrentProLicense
  }
)
