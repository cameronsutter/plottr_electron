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
    const uncategorized = {
      id: null,
      name: 'Uncategorized',
      position: -1,
      type: 'text',
    }

    switch (currentView) {
      case 'places': {
        const filteredItems = [...placesCategories, uncategorized].filter((category) =>
          allPlaces.find((place) => {
            if (category.name === 'Uncategorized' && !place.categoryId && !place.attributes) {
              return true
            }
            return String(place?.categoryId) === String(category.id)
          })
        )
        return filteredItems
      }
      case 'notes': {
        const filteredItems = [...notesCategories, uncategorized].filter((category) => {
          return allNotes.find((note) => {
            if (category.name === 'Uncategorized' && !note.categoryId && !note.attributes) {
              return true
            }
            return String(note?.categoryId) === String(category.id)
          })
        })
        return filteredItems
      }
      case 'characters': {
        const filteredItems = [...characterCategories, uncategorized].filter((category) => {
          return allCharacters.find((character) => {
            if (character?.attributes?.length) {
              return character.attributes.find(
                (attr) =>
                  // attribute[id] === 1 is character's category
                  attr.id === 1 &&
                  (String(attr.value) === String(category.id) ||
                    (category.name === 'Uncategorized' && !attr.value))
              )
            } else if (character.categoryId) {
              return String(character.categoryId) === String(category.id)
            } else if (
              category.name === 'Uncategorized' &&
              !character.categoryId &&
              !character.attributes
            ) {
              return true
            }
            return false
          })
        })
        return filteredItems
      }
      case 'tags': {
        const filteredItems = [...tagsCategories, uncategorized].filter((category) => {
          return allTags.find((tag) => {
            if (category.name === 'Uncategorized' && !tag.categoryId && !tag.attributes) {
              return true
            }
            return String(tag?.categoryId) === String(category.id)
          })
        })
        return filteredItems
      }
      default:
        return []
    }
  }
)
