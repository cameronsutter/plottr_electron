// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

export const trialInfoSelector = (state) => state.license.trialInfo
export const trialEndSelector = createSelector(trialInfoSelector, ({ endsAt }) => endsAt)
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
    return (
      startsAt !== null &&
      startsAt !== undefined &&
      endsAt !== null &&
      endsAt !== undefined &&
      extensions !== null &&
      extensions !== undefined
    )
  }
)
export const trialStartedOnSelector = createSelector(trialInfoSelector, ({ startsAt }) => startsAt)
export const trialEndsOnSelector = createSelector(trialInfoSelector, ({ endsAt }) => endsAt)

export const licenseInfoSelector = (state) => state.license.licenseInfo
export const licenseExpiresSelector = createSelector(licenseInfoSelector, ({ expires }) => expires)
export const licenseItemNameSelector = createSelector(
  licenseInfoSelector,
  ({ item_name }) => item_name && item_name.replace('&#8211;', '-')
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
  itemIdSelector,
  activationsLeftSelector,
  siteCountSelector,
  licenseLicenseSelector,
  (
    expires,
    itemName,
    customerEmail,
    licenseKey,
    itemId,
    activationsLeft,
    siteCount,
    licenseLicense
  ) => {
    return (
      expires !== null &&
      expires !== undefined &&
      itemName !== null &&
      itemName !== undefined &&
      customerEmail !== null &&
      customerEmail !== undefined &&
      licenseKey !== null &&
      licenseKey !== undefined &&
      itemId !== null &&
      itemId !== undefined &&
      activationsLeft !== null &&
      activationsLeft !== undefined &&
      siteCount !== null &&
      siteCount !== undefined &&
      licenseLicense !== null &&
      licenseLicense !== undefined
    )
  }
)

export const proInfoSelector = (state) => state.license.proLicenseInfo

export const proLicenseInfoSelector = (state) => state.license.proLicenseInfo
export const proLicenseExpirationSelector = createSelector(
  proLicenseInfoSelector,
  ({ expiration }) => expiration
)
export const proLicenseAdminSelector = createSelector(proLicenseInfoSelector, ({ admin }) => admin)
