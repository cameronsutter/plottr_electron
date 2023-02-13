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
            if (character.categoryId) {
              return String(character.categoryId) === String(category.id)
            } else if (character?.attributes?.length) {
              // attribute[id] === 1 is character's category
              return character.attributes.find(
                (attr) => attr.id === 1 && String(attr.value) === String(category.id)
              )
            }
            return false
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
