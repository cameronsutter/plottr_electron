import { sortBy } from 'lodash'
import { createSelector } from 'reselect'
import { charactersSortedInBookSelector } from './characters'
import { allNotesInBookSelector } from './notes'
import { placesSortedAtoZSelector } from './places'
import { sortedTagsSelector } from './tags'
import { currentViewSelector } from './ui'

export const allCategoriesSelector = (state) => state.categories
export const characterCategoriesSelector = (state) => state.categories.characters
export const noteCategoriesSelector = (state) => state.categories.notes
export const tagCategoriesSelector = (state) => state.categories.tags
export const placeCategoriesSelector = (state) => state.categories.places

export const sortedCharacterCategoriesSelector = createSelector(
  characterCategoriesSelector,
  (categories) => sortBy(categories, 'position')
)

export const sortedNoteCategoriesSelector = createSelector(noteCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

export const sortedTagCategoriesSelector = createSelector(tagCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

export const sortedPlaceCategoriesSelector = createSelector(placeCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

export const categoriesFilterItems = createSelector(
  currentViewSelector,
  sortedCharacterCategoriesSelector,
  sortedPlaceCategoriesSelector,
  sortedNoteCategoriesSelector,
  sortedTagCategoriesSelector,
  charactersSortedInBookSelector,
  placesSortedAtoZSelector,
  allNotesInBookSelector,
  sortedTagsSelector,
  (
    currentView,
    characterCategories,
    placesCategories,
    notesCategories,
    tagsCategories,
    allCharacters,
    allPlaces,
    allNotes,
    allTags
  ) => {
    switch (currentView) {
      case 'places': {
        const filteredItems = placesCategories.filter((category) =>
          allPlaces.find((place) => String(place?.categoryId) === String(category.id))
        )
        return filteredItems
      }
      case 'notes': {
        const filteredItems = notesCategories.filter((category) =>
          allNotes.find((note) => String(note?.categoryId) === String(category.id))
        )
        return filteredItems
      }
      case 'characters': {
        const filteredItems = characterCategories.filter((category) => {
          return allCharacters.find((character) => {
            return String(character?.categoryId) === String(category.id)
          })
        })
        return filteredItems
      }
      case 'tags': {
        const filteredItems = tagsCategories.filter((category) => {
          return allTags.find((tag) => String(tag?.categoryId) === String(category.id))
        })
        return filteredItems
      }
      default:
        return []
    }
  }
)
