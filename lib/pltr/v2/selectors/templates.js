import { createSelector } from 'reselect'

import { isLoggedInSelector } from './client'

export const templatesSelector = (state) => state.templates.templates
export const allCustomTemplatesSelector = (state) => state.templates.customTemplates
export const customTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  isLoggedInSelector,
  (allCustomTemplates, isLoggedIn) => {
    // Produce cloud templates when logged in and non-cloud templates
    // when not logged in.
    return allCustomTemplates.filter(({ isCloudTemplate }) => isCloudTemplate === isLoggedIn)
  }
)
export const fileSystemCustomTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  (customTemplates) => {
    return customTemplates.filter(({ isCloudTemplate }) => !isCloudTemplate)
  }
)
export const templateManifestSelector = (state) => state.templates.templateManifets
