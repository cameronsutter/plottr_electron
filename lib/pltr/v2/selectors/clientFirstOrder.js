import { createSelector } from 'reselect'

const clientSelector = (state) => {
  return state.client || {}
}
export const userIdSelector = createSelector(clientSelector, ({ userId }) => userId)
export const clientIdSelector = createSelector(clientSelector, ({ clientId }) => clientId)
export const emailAddressSelector = createSelector(
  clientSelector,
  ({ emailAddress }) => emailAddress
)
export const hasOnboardedSelector = createSelector(
  clientSelector,
  ({ hasOnboarded }) => hasOnboarded
)
export const hasProSelector = createSelector(clientSelector, ({ hasPro }) => hasPro)
export const isLoggedInSelector = createSelector(clientSelector, (client) => !!client.userId)
export const isOnWebSelector = createSelector(clientSelector, ({ isOnWeb }) => isOnWeb)
export const currentAppStateSelector = createSelector(
  clientSelector,
  ({ currentAppState }) => currentAppState
)
export const currentAppStateIsDashboardSelector = createSelector(
  currentAppStateSelector,
  (currentAppState) => currentAppState === 'dashboard'
)
