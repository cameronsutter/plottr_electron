import { createSelector } from 'reselect'

import { outOfOrderSearch } from '../helpers/outOfOrderSearch'

// Other selector dependencies
import {
  sortedTagsSelector,
  stringifiedTagsByIdSelector,
  tagsByCategorySelector,
} from './tagsFirstOrder'
import { currentViewSelector, tagsSearchTermSelector } from './secondOrder'
import { charactersSortedAtoZSelector } from './charactersFirstOrder'
import { placesSortedAtoZSelector } from './placesFirstOrder'
import { allNotesInBookSelector } from './notesThirdOrder'
import { allCardsSelector } from './cardsFirstOrder'
import { characterAttributesForBookSelector } from './attributesFirstOrder'

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

export const tagsFilterItemsSelector = createSelector(
  currentViewSelector,
  sortedTagsSelector,
  charactersSortedAtoZSelector,
  placesSortedAtoZSelector,
  allNotesInBookSelector,
  allCardsSelector,
  characterAttributesForBookSelector,
  (currentView, tags, characters, places, notes, cards, characterAttributes) => {
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
        const filteredItems = tags.filter((tag) => {
          return characters.find((character) => {
            const tagAttr = characterAttributes.find((charAttr) => charAttr.name === 'tags')
            if (character?.attributes?.length && tagAttr) {
              return character.attributes.find(
                (attr) =>
                  Array.isArray(attr?.value) &&
                  attr.value.includes(tag.id) &&
                  tagAttr.id === attr.id
              )
            } else {
              return character.tags?.includes(tag.id)
            }
          })
        })
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
