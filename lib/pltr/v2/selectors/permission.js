import { createSelector } from 'reselect'

export const permissionSelector = (state) => state.permission && state.permission.permission
export const canReadSelector = createSelector(
  permissionSelector,
  (permission) => permission === 'owner' || permission === 'collaborator' || permission === 'viewer'
)
export const canWriteSelector = createSelector(
  permissionSelector,
  (permission) => permission === 'owner' || permission === 'collaborator'
)
export const canAdministrateSelector = createSelector(
  permissionSelector,
  (permission) => permission === 'owner'
)
