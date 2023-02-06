import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

// Other selector dependencies
import { isLoggedInSelector } from './clientFirstOrder'
import {
  allCustomTemplatesSelector,
  templateSearchTermSelector,
  templatesSelector,
  templateTypeSelector,
} from './templatesFirstOrder'

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

const templateIdSelector = (state, templateId) => templateId
export const templateByIdSelector = createSelector(
  templatesSelector,
  customTemplatesSelector,
  templateIdSelector,
  (templates, customTemplates, templateId) => {
    const finder = ({ id }) => id === templateId
    return templates.find(finder) || customTemplates.find(finder)
  }
)
export const templateByIdFnSelector = createSelector(
  templatesSelector,
  customTemplatesSelector,
  (templates, customTemplates) => (templateId) => {
    const finder = ({ id }) => id === templateId
    return templates.find(finder) || customTemplates.find(finder)
  }
)

export const filteredSortedCustomTemplatesSelector = createSelector(
  customTemplatesSelector,
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
