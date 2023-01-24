import { createSelector } from 'reselect'
import { sortBy } from 'lodash'

const unsortedStarterTemplatesSelector = (state) => state.templates.templates
export const templatesSelector = createSelector(unsortedStarterTemplatesSelector, (templates) =>
  sortBy(Object.values(templates), 'name')
)
export const allCustomTemplatesSelector = (state) => state.templates.customTemplates
export const fileSystemCustomTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  (customTemplates) => {
    return customTemplates.filter(({ isCloudTemplate }) => !isCloudTemplate)
  }
)
export const templateManifestSelector = (state) => state.templates.templateManifets
export const templateTypeSelector = (state, type) => type
export const templateSearchTermSelector = (state, _, searchTerm) => searchTerm
export const filteredSortedStarterTemplatesSelector = createSelector(
  templatesSelector,
  templateTypeSelector,
  templateSearchTermSelector,
  (templates, type, searchTerm) => {
    return sortBy(
      templates.filter((t) => {
        if (searchTerm && searchTerm.length > 1) {
          return t.name.toLowerCase().includes(searchTerm) && t.type == type
        } else if (type) {
          return t.type == type
        } else {
          return true
        }
      }),
      'name'
    )
  }
)
