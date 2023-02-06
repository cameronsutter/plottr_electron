import { groupBy, differenceWith, isEqual, mapValues, uniq, omit } from 'lodash'
import { createSelector } from 'reselect'

import { outOfOrderSearch } from '../helpers/outOfOrderSearch'
import { isSeries } from '../helpers/books'

// Other selector dependencies
import { showBookTabs } from './attributeTabsFirstOrder'
import { allBookIdsSelector, allBooksSelector } from './booksFirstOrder'
import {
  allCharactersSelector,
  displayedSingleCharacter,
  singleCharacterSelector,
} from './charactersFirstOrder'
import {
  attributesSelector,
  characterAttributsForBookByIdSelector,
  overriddenBookIdSelector,
} from './attributesFirstOrder'
import { characterCustomAttributesSelector } from './customAttributesFirstOrder'
import { sortEachCategory } from './sortEachCategory'
import {
  uiSelector,
  charactersSearchTermSelector,
  characterFilterSelector,
  characterCustomAttributeOrderSelector,
  characterSortSelector,
  currentTimelineSelector,
  currentViewSelector,
} from './secondOrder'
import { charactersSortedAtoZSelector } from './charactersFirstOrder'
import { placesSortedAtoZSelector } from './placesFirstOrder'
import { allNotesInBookSelector } from './notesThirdOrder'
import { allCardsSelector } from './cardsFirstOrder'

export const attributeTabsSelector = createSelector(uiSelector, ({ attributeTabs }) => {
  return attributeTabs || {}
})

export const showBookTabsSelector = createSelector(
  allBookIdsSelector,
  allCharactersSelector,
  showBookTabs
)

export const selectedCharacterAttributeTabSelector = createSelector(
  attributeTabsSelector,
  showBookTabsSelector,
  ({ characters }, showTabs) => {
    return showTabs ? characters || 'all' : 'all'
  }
)

export const characterAttributeTabSelector = createSelector(
  selectedCharacterAttributeTabSelector,
  showBookTabsSelector,
  (selectedTab, showTabs) => {
    return !showTabs ? 'all' : selectedTab
  }
)

export const allDisplayedCharactersSelector = createSelector(
  allCharactersSelector,
  characterAttributeTabSelector,
  characterAttributsForBookByIdSelector,
  overriddenBookIdSelector,
  (characters, bookId, currentBookAttributeDescirptorsById, overridenBookId) => {
    return characters.map((character) =>
      displayedSingleCharacter(
        character,
        overridenBookId || bookId,
        currentBookAttributeDescirptorsById
      )
    )
  }
)

export const displayedCharactersByCategorySelector = createSelector(
  allDisplayedCharactersSelector,
  (characters) => groupBy(characters, 'categoryId')
)

export const characterAttributesForCurrentBookSelector = createSelector(
  attributesSelector,
  characterCustomAttributesSelector,
  selectedCharacterAttributeTabSelector,
  characterCustomAttributeOrderSelector,
  (attributes, legacyAttributes, bookId, order) => {
    const bookAttributes = (attributes && attributes.characters) || []
    const newAttributes = bookAttributes.filter((attribute) => {
      return attribute.type !== 'base-attribute'
    })
    const ordered = order.map((entry) => {
      if (entry.type === 'attributes') {
        return newAttributes.find(({ id }) => {
          return id === entry.id
        })
      } else {
        return legacyAttributes.find(({ name }) => {
          return name === entry.name
        })
      }
    })
    const missing = differenceWith([...newAttributes, ...legacyAttributes], ordered, isEqual)
    return [...ordered, ...missing]
  }
)

export const characterFilterIsEmptySelector = createSelector(
  characterFilterSelector,
  characterAttributesForCurrentBookSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [{ name: 'tag' }, { name: 'book' }, { name: 'category' }, ...attributes]
    return !allAttributes.some((attr) => {
      const key = attr.id || attr.name
      return filter[key] && filter[key].length
    })
  }
)

export const visibleSortedCharactersByCategorySelector = createSelector(
  allDisplayedCharactersSelector,
  displayedCharactersByCategorySelector,
  characterFilterSelector,
  characterFilterIsEmptySelector,
  characterSortSelector,
  characterAttributesForCurrentBookSelector,
  characterAttributeTabSelector,
  (allCharacters, charactersByCategory, filter, filterIsEmpty, sort, allAttributes, bookId) => {
    if (!allCharacters.length) return {}

    let visible = charactersByCategory
    if (!filterIsEmpty) {
      visible = {}
      allCharacters.forEach((ch) => {
        const matches = Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return ch.tags.includes(val)
            }
            if (attr == 'book') {
              return ch.bookIds.includes(val)
            }
            if (attr == 'category') {
              return ch.categoryId == val
            }

            // It could be a new attribute
            const characterAttributes = ch.attributes || []
            const attributeFound = characterAttributes.find((attribute) => {
              return attribute?.id?.toString() === attr && attribute.bookId === bookId
            })
            const definesAttribute =
              attributeFound?.value === val ||
              (attributeFound && attributeFound.value === undefined && val === '')
            if (definesAttribute) {
              return true
            }

            // Or it could be a legacy attribute
            if (!attributeFound) {
              if (val == '') {
                if (!ch[attr] || ch[attr] == '') return true
              } else {
                if (ch[attr] && ch[attr] == val) return true
              }
            }

            return false
          })
        })
        if (matches) {
          if (visible[ch.categoryId] && visible[ch.categoryId].length) {
            visible[ch.categoryId].push(ch)
          } else {
            visible[ch.categoryId] = [ch]
          }
        }
      })
    } else {
      visible = mapValues(visible, (ch) => {
        return ch.filter((c) => bookId === 'all' || c.bookIds.includes(bookId))
      })
    }

    return sortEachCategory(visible, sort)
  }
)

const stringifiedCharactersByIdSelector = createSelector(allCharactersSelector, (characters) => {
  return characters.reduce((acc, nextCharacter) => {
    return {
      ...acc,
      [nextCharacter.id]: JSON.stringify(nextCharacter).toLowerCase(),
    }
  }, {})
})

export const visibleSortedSearchedCharactersByCategorySelector = createSelector(
  visibleSortedCharactersByCategorySelector,
  charactersSearchTermSelector,
  stringifiedCharactersByIdSelector,
  (characterCategories, searchTerm, stringifiedCharacters) => {
    if (!searchTerm) return characterCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(characterCategories).reduce((acc, nextCategory) => {
      const [key, characters] = nextCategory
      const newCharacters = characters.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedCharacters[id])
      })
      if (newCharacters.length > 0) {
        return {
          ...acc,
          [key]: newCharacters,
        }
      } else {
        return acc
      }
    }, {})
  }
)

// This selector produces a character with overridden attributes based
// on the book we're looking at.
export const displayedSingleCharacterSelector = createSelector(
  singleCharacterSelector,
  characterAttributeTabSelector,
  characterAttributsForBookByIdSelector,
  displayedSingleCharacter
)

export const allDisplayedCharactersForCurrentBookSelector = createSelector(
  allDisplayedCharactersSelector,
  characterAttributeTabSelector,
  overriddenBookIdSelector,
  (characters, selectedBookId, overriddenBookId) => {
    const bookId = overriddenBookId || selectedBookId || 'series'
    if (bookId === 'all' || bookId === 'series') {
      return characters
    }

    return characters.filter((character) => {
      return character.bookIds.indexOf(bookId) > -1
    })
  }
)

export const characterTemplateAttributeValueSelector =
  (characterId, templateId, attributeName) => (state) => {
    const bookId = characterAttributeTabSelector(state)
    const character = singleCharacterSelector(state, characterId)
    const templateOnCharacter = character && character.templates.find(({ id }) => id === templateId)
    const valueInAttributes =
      templateOnCharacter &&
      templateOnCharacter.attributes.find(({ name }) => name === attributeName).value
    const valueOnTemplate = templateOnCharacter && templateOnCharacter[attributeName]
    const valueForBook =
      templateOnCharacter.values &&
      templateOnCharacter.values.find((value) => {
        return value.name === attributeName && value.bookId === bookId
      })?.value
    return valueForBook || (bookId === 'all' && (valueInAttributes || valueOnTemplate))
  }

export const characterBookCategoriesSelector = createSelector(
  currentTimelineSelector,
  allCharactersSelector,
  (bookId, characters) => {
    const categoryMembership = characters.reduce((acc, character) => {
      if (character.bookIds.indexOf(bookId) > -1) {
        return {
          ...acc,
          'Characters In Book': [character.id, ...(acc['Characters In Book'] || [])],
        }
      }

      return {
        ...acc,
        'Not in Book': [character.id, ...(acc['Not in Book'] || [])],
      }
    }, {})
    return [
      categoryMembership['Characters In Book']?.length > 0
        ? [
            {
              displayHeading: false,
              key: 'Characters In Book',
              'Characters In Book': categoryMembership['Characters In Book'],
            },
          ]
        : [],
      categoryMembership['Not in Book']?.length > 0
        ? [
            {
              glyph: 'plus',
              displayHeading: true,
              key: 'Not in Book',
              'Not in Book': categoryMembership['Not in Book'],
              lineAbove: true,
            },
          ]
        : [],
    ].flatMap((x) => x)
  }
)

const combinedAttributesForCharacter = (
  character,
  attributes,
  customAttributes,
  selectedBookId,
  overridenBookId,
  order
) => {
  const characterBookAttributes = character.attributes || []
  const allAttributes = attributes.characters || []
  const bookId = overridenBookId || selectedBookId
  const newAttributes = allAttributes
    .filter((bookAttribute) => {
      return bookAttribute.type !== 'base-attribute'
    })
    .map((bookAttribute) => {
      const value = characterBookAttributes.find((attributeValue) => {
        return attributeValue.id === bookAttribute.id && attributeValue.bookId === bookId
      })
      return {
        value: '',
        ...bookAttribute,
        ...value,
      }
    })

  const legacyAttributes = customAttributes.map((customAttribute) => {
    const value = character[customAttribute.name] || ''
    return {
      ...customAttribute,
      value,
    }
  })

  const ordered = order.map((entry) => {
    if (entry.type === 'attributes') {
      return newAttributes.find(({ id }) => {
        return id === entry.id
      })
    } else {
      return legacyAttributes.find(({ name }) => {
        return name === entry.name
      })
    }
  })
  const missing = differenceWith([...newAttributes, ...legacyAttributes], ordered, isEqual)

  return [...ordered, ...missing]
}

export const characterAttributesSelector = createSelector(
  singleCharacterSelector,
  attributesSelector,
  characterCustomAttributesSelector,
  characterAttributeTabSelector,
  overriddenBookIdSelector,
  characterCustomAttributeOrderSelector,
  combinedAttributesForCharacter
)

export const characterAttributeValuesForCurrentBookSelector = createSelector(
  allCharactersSelector,
  attributesSelector,
  characterCustomAttributesSelector,
  characterAttributeTabSelector,
  characterCustomAttributeOrderSelector,
  (characters, attributes, customAttributes, bookId, order) => {
    const newAttributeValues = characters.reduce((acc, character) => {
      const attributesForCharacter = combinedAttributesForCharacter(
        character,
        attributes,
        customAttributes,
        bookId,
        null,
        order
      )
      attributesForCharacter.forEach((attribute) => {
        if (attribute.value !== undefined && attribute.value !== null && attribute.value !== '') {
          if (!Array.isArray(acc[attribute.id])) {
            acc[attribute.id] = [attribute.value]
          }
          acc[attribute.id].push(attribute.value)
          acc[attribute.id] = uniq(acc[attribute.id])
        }
      })
      return acc
    }, {})

    const legacyAttributes = customAttributes.reduce((acc, customAttribute) => {
      const values = characters
        .map((character) => {
          return character[customAttribute.name]
        })
        .filter((value) => {
          return value !== undefined && value !== null && value !== ''
        })
      return {
        ...acc,
        [customAttribute.name]: uniq(values),
      }
    }, {})

    return {
      ...newAttributeValues,
      ...legacyAttributes,
    }
  }
)

export const allBooksWithCharactersInThemSelector = createSelector(
  allBooksSelector,
  allCharactersSelector,
  showBookTabsSelector,
  (books, characters, showBookTabs) => {
    if (!showBookTabs) {
      return omit(books, 'allIds')
    }

    return Object.values(books)
      .filter((value) => {
        return characters.some((character) => {
          return character.bookIds.indexOf(value.id) !== -1
        })
      })
      .reduce((acc, next) => {
        return {
          ...acc,
          [next.id]: next,
        }
      }, {})
  }
)

export const charactersSortedInBookSelector = createSelector(
  charactersSortedAtoZSelector,
  currentTimelineSelector,
  (characters, bookId) =>
    characters.filter((character) => {
      if (character.bookIds.length === 0) return true
      if (character.bookIds.some(isSeries)) return true
      return character.bookIds.includes(bookId)
    })
)

export const charactersFilterItems = createSelector(
  currentViewSelector,
  charactersSortedAtoZSelector,
  placesSortedAtoZSelector,
  allNotesInBookSelector,
  allCardsSelector,
  (currentView, characters, places, notes, cards) => {
    switch (currentView) {
      case 'places': {
        const filteredItems = characters.filter((char) =>
          places.find((place) => place.characters?.includes(char.id))
        )
        return filteredItems
      }
      case 'notes': {
        const filteredItems = characters.filter((char) =>
          notes.find((note) => note.characters?.includes(char.id))
        )
        return filteredItems
      }
      case 'timeline': {
        const filteredItems = characters.filter((char) =>
          cards.find((card) => card.characters?.includes(char.id))
        )
        return filteredItems
      }
      default:
        return []
    }
  }
)
