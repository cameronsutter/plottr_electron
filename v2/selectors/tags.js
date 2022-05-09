import { sortBy, groupBy } from 'lodash'
import { createSelector } from 'reselect'
import { tagsSearchTermSelector } from './ui'

export const allTagsSelector = (state) => state.tags
const selectId = (state, id) => id

export const sortedTagsSelector = createSelector(allTagsSelector, (tags) =>
  sortBy(tags, ['title', 'id'])
)

export const singleTagSelector = createSelector(allTagsSelector, selectId, (tags, propId) =>
  tags.find((tag) => tag.id == propId)
)

export const tagsByCategorySelector = createSelector(allTagsSelector, (tags) => {
  const grouped = groupBy(tags, 'categoryId')
  if (grouped[undefined] !== undefined) {
    grouped[null] = grouped[undefined].concat(grouped[null] || [])
    delete grouped[undefined]
  }
  return grouped
})

export const searchedTagsByCategorySelector = createSelector(
  tagsByCategorySelector,
  tagsSearchTermSelector,
  (tagCategories, searchTerm) => {
    if (!searchTerm) return tagCategories

    const lowSearchTerm = searchTerm.toLowerCase()
    return Object.entries(tagCategories).reduce((acc, nextCategory) => {
      const [key, notes] = nextCategory
      const newNotes = notes.filter(({ title }) => {
        return title.toLowerCase().match(lowSearchTerm)
      })
      if (newNotes.length > 0) {
        return {
          ...acc,
          [key]: newNotes,
        }
      } else {
        return acc
      }
    }, {})
  }
)
