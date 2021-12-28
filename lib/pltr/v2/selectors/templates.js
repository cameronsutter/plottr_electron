import { createSelector } from 'reselect'
import { sortBy } from 'lodash'

import { isLoggedInSelector } from './client'

export const templatesSelector = (state) => sortBy(Object.values(state.templates.templates), 'name')
export const allCustomTemplatesSelector = (state) => state.templates.customTemplates
export const customTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  isLoggedInSelector,
  (allCustomTemplates, isLoggedIn) => {
    // Produce cloud templates when logged in and non-cloud templates
    // when not logged in.
    return sortBy(
      allCustomTemplates.filter(({ isCloudTemplate }) => !!isCloudTemplate === !!isLoggedIn),
      'name'
    )
  }
)
export const fileSystemCustomTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  (customTemplates) => {
    return customTemplates.filter(({ isCloudTemplate }) => !isCloudTemplate)
  }
)
export const templateManifestSelector = (state) => state.templates.templateManifets
export const templateIdSelector = (state, templateId) => templateId
export const templateByIdSelector = createSelector(
  templatesSelector,
  customTemplatesSelector,
  templateIdSelector,
  (templates, customTemplates, templateId) => {
    const finder = ({ id }) => id === templateId
    return templates.find(finder) || customTemplates.find(finder)
  }
)
