import { createSelector } from 'reselect'

export const userIdSelector = (state) => state.client.userId
export const clientIdSelector = (state) => state.client.clientId
export const emailAddressSelector = (state) => state.client.emailAddress
export const hasProSelector = (state) => state.client.hasPro
export const isLoggedInSelector = (state) => !!state.client.userId
export const currentAppStateSelector = (state) => state.client.currentAppState
export const currentAppStateIsDashboardSelector = createSelector(
  currentAppStateSelector,
  (currentAppState) => currentAppState === 'dashboard'
)
