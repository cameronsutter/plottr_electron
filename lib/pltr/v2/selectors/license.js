import { createSelector } from 'reselect'

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
