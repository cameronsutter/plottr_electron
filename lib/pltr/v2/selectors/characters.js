import { createSelector } from 'reselect'
import { sortBy, groupBy, uniq, mapValues } from 'lodash'
import {
  characterSortSelector,
  characterFilterSelector,
  currentTimelineSelector,
  charactersSearchTermSelector,
  selectedCharacterAttributeTabSelector,
} from './ui'
import { isSeries } from '../helpers/books'
import { outOfOrderSearch } from '../helpers/outOfOrderSearch'
import {
  attributesSelector,
  characterAttributesForCurrentBookSelector,
  characterAttributsForBookByIdSelector,
  overriddenBookIdSelector,
} from './attributes'
import { allBookIdsSelector } from './books'
import { showBookTabs } from './attributeTabs'

export const allCharactersSelector = (state) => state.characters

export const showBookTabsSelector = createSelector(
  allBookIdsSelector,
  allCharactersSelector,
  showBookTabs
)

export const characterAttributeTabSelector = createSelector(
  selectedCharacterAttributeTabSelector,
  showBookTabsSelector,
  (selectedTab, showTabs) => {
    return !showTabs ? 'all' : selectedTab
  }
)

// this one also lives in ./customAttributes.js but it causes a circular dependency to import it here

const selectId = (state, id) => id

export const singleCharacterSelector = createSelector(
  allCharactersSelector,
  selectId,
  (characters, propId) => characters.find((ch) => ch.id == propId)
)

const displayedSingleCharacter = (character, bookId, currentBookAttributeDescirptorsById) => {
  const currentBookAttributes = character.attributes || []

  const tags =
    currentBookAttributes.find((attribute) => {
      return (
        attribute.bookId === bookId &&
        currentBookAttributeDescirptorsById[attribute.id].type === 'base-attribute' &&
        currentBookAttributeDescirptorsById[attribute.id].name === 'tags'
      )
    })?.value ||
    (bookId === 'all' && character.tags) ||
    []

  const description =
    currentBookAttributes.find((attribute) => {
      return (
        attribute.bookId === bookId &&
        currentBookAttributeDescirptorsById[attribute.id].type === 'base-attribute' &&
        currentBookAttributeDescirptorsById[attribute.id].name === 'shortDescription'
      )
    })?.value ||
    (bookId === 'all' && character.description) ||
    ''

  const notes =
    currentBookAttributes.find((attribute) => {
      return (
        attribute.bookId === bookId &&
        currentBookAttributeDescirptorsById[attribute.id].type === 'base-attribute' &&
        currentBookAttributeDescirptorsById[attribute.id].name === 'description'
      )
    })?.value ||
    (bookId === 'all' && character.notes) ||
    ''

  const categoryId =
    currentBookAttributes.find((attribute) => {
      return (
        attribute.bookId === bookId &&
        currentBookAttributeDescirptorsById[attribute.id].type === 'base-attribute' &&
        currentBookAttributeDescirptorsById[attribute.id].name === 'category'
      )
    })?.value ||
    (bookId === 'all' && character.categoryId) ||
    null

  return {
    ...character,
    tags,
    description,
    notes,
    categoryId,
  }
}

// This selector produces a character with overridden attributes based
// on the book we're looking at.
export const displayedSingleCharacterSelector = createSelector(
  singleCharacterSelector,
  characterAttributeTabSelector,
  characterAttributsForBookByIdSelector,
  displayedSingleCharacter
)

export const charactersByCategorySelector = createSelector(allCharactersSelector, (characters) =>
  groupBy(characters, 'categoryId')
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

export const displayedCharactersByCategorySelector = createSelector(
  allDisplayedCharactersSelector,
  (characters) => groupBy(characters, 'categoryId')
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

function sortEachCategory(visibleByCategory, sort) {
  let sortOperands = sort.split('~')
  let attrName = sortOperands[0]
  let direction = sortOperands[1]
  let sortByOperand = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']

  Object.keys(visibleByCategory).forEach((k) => {
    let characters = visibleByCategory[k]

    let sorted = sortBy(characters, sortByOperand)
    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}

export const charactersSortedAtoZSelector = createSelector(allCharactersSelector, (characters) =>
  sortBy(characters, 'name')
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

const characterCustomAttributes = (state) => state.customAttributes.characters

const combinedAttributesForCharacter = (
  character,
  attributes,
  customAttributes,
  selectedBookId,
  overridenBookId
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

  return [...newAttributes, ...legacyAttributes]
}

export const characterAttributesSelector = createSelector(
  singleCharacterSelector,
  attributesSelector,
  characterCustomAttributes,
  characterAttributeTabSelector,
  overriddenBookIdSelector,
  combinedAttributesForCharacter
)

export const characterAttributeValuesForCurrentBookSelector = createSelector(
  allCharactersSelector,
  attributesSelector,
  characterCustomAttributes,
  characterAttributeTabSelector,
  (characters, attributes, customAttributes, bookId) => {
    const newAttributeValues = characters.reduce((acc, character) => {
      const attributesForCharacter = combinedAttributesForCharacter(
        character,
        attributes,
        customAttributes,
        bookId
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

export const characterBookCategoriesSelector = createSelector(
  allBookIdsSelector,
  allCharactersSelector,
  (bookIds, characters) => {
    return characters.reduce((acc, character) => {
      return {
        ...acc,
        [character.id]: bookIds.reduce((categories, bookId) => {
          if (character.bookIds.indexOf(bookId) > -1) {
            return {
              ...categories,
              Associated: [bookId, ...(categories.Associated || [])],
            }
          }

          return {
            ...categories,
            Unassociated: [bookId, ...(categories.Unassociated || [])],
          }
        }, {}),
      }
    }, {})
  }
)
