import { createSelector } from 'reselect'

import {
  sortedCharacterCategoriesSelector,
  sortedNoteCategoriesSelector,
  sortedPlaceCategoriesSelector,
  sortedTagCategoriesSelector,
} from './categoriesFirstOrder'
import { charactersSortedInBookSelector } from './charactersThirdOrder'
import { allNotesInBookSelector } from './notesThirdOrder'
import { placesSortedAtoZSelector } from './placesFirstOrder'
import { currentViewSelector } from './secondOrder'
import { sortedTagsSelector } from './tagsFirstOrder'

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
