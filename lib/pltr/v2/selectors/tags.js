import { sortBy, groupBy } from 'lodash'
import { createSelector } from 'reselect'
import { outOfOrderSearch } from '../helpers/outOfOrderSearch'
import { allCardsSelector } from './cards'
import { charactersSortedAtoZSelector } from './characters'
import { allNotesInBookSelector } from './notes'
import { placesSortedAtoZSelector } from './places'
import { currentViewSelector, tagsSearchTermSelector } from './ui'

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

const stringifiedTagsByIdSelector = createSelector(allTagsSelector, (tags) => {
  return tags.reduce((acc, nextTag) => {
    return {
      ...acc,
      [nextTag.id]: JSON.stringify(nextTag).toLowerCase(),
    }
  }, {})
})

export const searchedTagsByCategorySelector = createSelector(
  tagsByCategorySelector,
  tagsSearchTermSelector,
  stringifiedTagsByIdSelector,
  (tagCategories, searchTerm, stringifiedTags) => {
    if (!searchTerm) return tagCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(tagCategories).reduce((acc, nextCategory) => {
      const [key, notes] = nextCategory
      const newNotes = notes.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedTags[id])
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

export const tagsFilterItems = createSelector(
  currentViewSelector,
  sortedTagsSelector,
  charactersSortedAtoZSelector,
  placesSortedAtoZSelector,
  allNotesInBookSelector,
  allCardsSelector,
  (currentView, tags, characters, places, notes, cards) => {
    switch (currentView) {
      case 'places': {
        const filteredItems = tags.filter((tag) =>
          places.find((place) => place.tags?.includes(tag.id))
        )
        return filteredItems
      }
      case 'notes': {
        const filteredItems = tags.filter((tag) =>
          notes.find((note) => note.tags?.includes(tag.id))
        )
        return filteredItems
      }
      case 'characters': {
        const filteredItems = tags.filter((tag) =>
          characters.find((char) => char.tags?.includes(tag.id))
        )
        return filteredItems
      }
      case 'timeline': {
        const filteredItems = tags.filter((tag) =>
          cards.find((card) => card.tags?.includes(tag.id))
        )
        return filteredItems
      }
      default:
        return []
    }
  }
)
