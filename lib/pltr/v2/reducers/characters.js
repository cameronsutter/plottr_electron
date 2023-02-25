import { cloneDeep, omit, uniq } from 'lodash'
import {
  ADD_CHARACTER,
  ADD_CHARACTER_WITH_TEMPLATE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
  ATTACH_CHARACTER_TO_CARD,
  REMOVE_CHARACTER_FROM_CARD,
  ATTACH_CHARACTER_TO_NOTE,
  REMOVE_CHARACTER_FROM_NOTE,
  DELETE_NOTE,
  DELETE_CARD,
  DELETE_CHARACTER,
  DELETE_IMAGE,
  ATTACH_TAG_TO_CHARACTER,
  REMOVE_TAG_FROM_CHARACTER,
  ATTACH_BOOK_TO_CHARACTER,
  REMOVE_BOOK_FROM_CHARACTER,
  DELETE_CHARACTER_CATEGORY,
  DELETE_TAG,
  LOAD_CHARACTERS,
  ADD_TEMPLATE_TO_CHARACTER,
  REMOVE_TEMPLATE_FROM_CHARACTER,
  EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
  DUPLICATE_CHARACTER,
  CREATE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_VALUE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  DELETE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_SHORT_DESCRIPTION,
  EDIT_CHARACTER_DESCRIPTION,
  EDIT_CHARACTER_CATEGORY,
  DELETE_BOOK,
  EDIT_CHARACTER_NAME,
  EDIT_CHARACTER_IMAGE,
  DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE,
} from '../constants/ActionTypes'
import { character as defaultCharacter } from '../store/initialState'
import { newFileCharacters } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { applyToCustomAttributes } from './applyToCustomAttributes'
import { repairIfPresent } from './repairIfPresent'

const initialState = [defaultCharacter]

const firstParagraphText = (children) => {
  if (!Array.isArray(children) || children.length === 0) {
    return ''
  }

  const firstElement = children[0]
  if (typeof firstElement.text === 'string') {
    return firstElement.text
  }

  return firstParagraphText(firstElement.children)
}

const attachBaseAttribute = (attributeName, value, action, state) => {
  return state.map((character) => {
    if (character.id === action.id) {
      const attributeId = action.attributeId
      const newAttributes = character.attributes || []
      const hasAttribute = newAttributes.some((attribute) => {
        return (
          attribute.id === attributeId &&
          attribute.bookId === (action.bookId || action.currentBookId)
        )
      })
      const attributes = attributeId
        ? hasAttribute
          ? newAttributes.map((attribute) => {
              if (attribute.id === attributeId) {
                return {
                  ...attribute,
                  value: uniq([...attribute.value, value]),
                }
              }
              return attribute
            })
          : [
              ...newAttributes,
              {
                id: attributeId,
                bookId: action.bookId || action.currentBookId,
                value: [value, ...character[attributeName]],
              },
            ]
        : newAttributes

      return {
        ...character,
        attributes,
      }
    }
    return character
  })
}

const removeTag = (attributeName, value, action, state) => {
  return state.map((character) => {
    if (character.id === action.id) {
      const attributeId = action.attributeId
      const newAttributes = character.attributes || []
      const hasAttribute = newAttributes.some((attribute) => {
        return (
          attribute.id === attributeId &&
          attribute.bookId === (action.bookId || action.currentBookId)
        )
      })
      const attributes = attributeId
        ? hasAttribute
          ? newAttributes.map((attribute) => {
              if (
                attribute.id === attributeId &&
                attribute.bookId === (action.bookId || action.currentBookId)
              ) {
                return {
                  ...attribute,
                  value: attribute.value.filter((x) => x !== value),
                }
              }
              return attribute
            })
          : [
              ...newAttributes,
              {
                id: attributeId,
                bookId: action.bookId || action.currentBookId,
                value: character[attributeName].filter((x) => x !== value),
              },
            ]
        : newAttributes

      return {
        ...character,
        attributes,
      }
    }

    return character
  })
}

const DISALLOWED_NAMES = [
  'notes',
  'categoryId',
  'id',
  'name',
  'color',
  'cards',
  'noteIds',
  'templates',
  'tags',
  'imageId',
  'bookIds',
]

const characters =
  (dataRepairers) =>
  (state = initialState, action) => {
    const repair = repairIfPresent(dataRepairers)

    switch (action.type) {
      case ADD_CHARACTER:
        return [
          ...state,
          {
            ...defaultCharacter,
            id: nextId(state),
            name: action.name,
            description: action.description,
            notes: action.notes,
            ...(action.currentBookId !== 'all' ? { bookIds: [action.currentBookId] } : {}),
          },
        ]

      case ADD_CHARACTER_WITH_TEMPLATE: {
        const templateData = {
          id: action.templateData.id,
          version: action.templateData.version,
          attributes: action.templateData.attributes,
          value: '',
        }
        return [
          ...state,
          {
            ...defaultCharacter,
            id: nextId(state),
            name: action.name,
            description: action.description,
            notes: action.notes,
            templates: [templateData],
          },
        ]
      }

      case EDIT_CHARACTER_NAME: {
        return state.map((character) => {
          if (character.id === action.id) {
            return {
              ...character,
              name: action.name,
            }
          }

          return character
        })
      }

      case EDIT_CHARACTER_IMAGE: {
        return state.map((character) => {
          if (character.id === action.id) {
            return {
              ...character,
              imageId: action.imageId,
            }
          }

          return character
        })
      }

      case EDIT_CHARACTER_TEMPLATE_ATTRIBUTE: {
        return state.map((character) => {
          if (character.id === action.id) {
            return {
              ...character,
              templates: character.templates.map((template) => {
                if (template.id === action.templateId) {
                  const templateHasAttribute = template.attributes.some((attribute) => {
                    return attribute.name === action.name
                  })
                  if (!templateHasAttribute) {
                    return template
                  }
                  const isAttributeValue = (attribute) => {
                    return attribute.bookId === action.bookId && attribute.name === action.name
                  }
                  const hasAttributeValue = (template.values || []).some(isAttributeValue)
                  return {
                    ...template,
                    values: hasAttributeValue
                      ? (template.values || []).map((attribute) => {
                          if (isAttributeValue(attribute))
                            return {
                              ...attribute,
                              value: action.value,
                            }

                          return attribute
                        })
                      : [
                          ...(template.values || []),
                          { name: action.name, value: action.value, bookId: action.bookId },
                        ],
                  }
                }
                return template
              }),
            }
          }
          return character
        })
      }

      case ADD_TEMPLATE_TO_CHARACTER:
        return state.map((character) => {
          if (character.id === action.id) {
            if (character.templates.some(({ id }) => id === action.templateData.id)) {
              return character
            }
            const newCharacter = cloneDeep(character)
            newCharacter.templates.push({
              id: action.templateData.id,
              version: action.templateData.version,
              attributes: action.templateData.attributes,
              value: '',
            })
            return newCharacter
          } else {
            return character
          }
        })

      case ATTACH_CHARACTER_TO_CARD:
        return state.map((character) => {
          return character.id === action.characterId
            ? {
                ...character,
                bookIds: uniq([action.currentTimeline, ...character.bookIds]),
                cards: [action.id, ...character.cards],
              }
            : character
        })

      case REMOVE_CHARACTER_FROM_CARD:
        return state.map((character) => {
          let cards = cloneDeep(character.cards)
          cards.splice(cards.indexOf(action.id), 1)
          return character.id === action.characterId
            ? Object.assign({}, character, { cards: cards })
            : character
        })

      case ATTACH_CHARACTER_TO_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          notes.push(action.id)
          return character.id === action.characterId
            ? Object.assign({}, character, { noteIds: notes })
            : character
        })

      case REMOVE_CHARACTER_FROM_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          notes.splice(notes.indexOf(action.id), 1)
          return character.id === action.characterId
            ? Object.assign({}, character, { noteIds: notes })
            : character
        })

      case ATTACH_TAG_TO_CHARACTER: {
        return attachBaseAttribute('tags', action.tagId, action, state)
      }

      case REMOVE_TAG_FROM_CHARACTER: {
        return removeTag('tags', action.tagId, action, state)
      }

      case DELETE_TAG: {
        return state.map((character) => {
          if (!Array.isArray(character.attributes)) {
            return character
          }

          const characterHasAttribute = character.attributes.some((attribute) => {
            return action.attributeId === attribute.id
          })
          if (characterHasAttribute) {
            return {
              ...character,
              attributes: character.attributes.map((attribute) => {
                if (action.attributeId === attribute.id) {
                  return {
                    ...attribute,
                    value: attribute.value.filter((tagId) => {
                      return tagId !== action.id
                    }),
                  }
                }

                return attribute
              }),
            }
          }

          return character
        })
      }

      case ATTACH_BOOK_TO_CHARACTER: {
        return state.map((character) => {
          let bookIds = cloneDeep(character.bookIds)
          bookIds.push(action.bookId)
          return character.id === action.id
            ? Object.assign({}, character, { bookIds: bookIds })
            : character
        })
      }

      case REMOVE_BOOK_FROM_CHARACTER: {
        return state.map((character) => {
          return character.id === action.id
            ? { ...character, bookIds: character.bookIds.filter((id) => id !== action.bookId) }
            : character
        })
      }

      case REMOVE_TEMPLATE_FROM_CHARACTER:
        return state.map((character) => {
          if (character.id !== action.id) return character
          const newTemplates = character.templates.filter((t) => t.id != action.templateId)
          return Object.assign({}, character, { templates: newTemplates })
        })

      case DELETE_BOOK: {
        return state.map((character) => {
          if (character.bookIds.indexOf(action.id) > -1) {
            return {
              ...character,
              bookIds: character.bookIds.filter((bookId) => {
                return bookId !== action.id
              }),
            }
          }

          return character
        })
      }

      case DELETE_NOTE:
        return state.map((character) => {
          let notes = cloneDeep(character.noteIds)
          notes.splice(notes.indexOf(action.id), 1)
          return Object.assign({}, character, { noteIds: notes })
        })

      case DELETE_CARD:
        return state.map((character) => {
          let cards = cloneDeep(character.cards)
          cards.splice(cards.indexOf(action.id), 1)
          return Object.assign({}, character, { cards: cards })
        })

      case DELETE_CHARACTER:
        return state.filter((character) => character.id !== action.id)

      case DELETE_IMAGE:
        return state.map((ch) => {
          if (action.id == ch.imageId) {
            return {
              ...ch,
              imageId: null,
            }
          } else {
            return ch
          }
        })

      case RESET:
      case FILE_LOADED:
        return action.data.characters.map((character) => {
          const normalizeRCEContent = repair('normalizeRCEContent')
          return {
            ...character,
            ...applyToCustomAttributes(
              character,
              normalizeRCEContent,
              action.data.customAttributes.characters,
              'paragraph'
            ),
            notes: normalizeRCEContent(character.notes),
          }
        })

      case NEW_FILE:
        return newFileCharacters

      case DELETE_CHARACTER_CATEGORY: {
        return state.map((rawCharacter) => {
          // Problem is here.  Also take a look at whether deleting
          // tags works now.
          const character =
            rawCharacter?.categoryId?.toString() === action.categoryId.toString()
              ? {
                  ...rawCharacter,
                  categoryId: null,
                }
              : rawCharacter

          if (!Array.isArray(character.attributes)) {
            return character
          }

          const characterHasAttribute = character.attributes.some((attribute) => {
            return action.attributeId === attribute.id
          })
          if (characterHasAttribute) {
            return {
              ...character,
              attributes: character.attributes.map((attribute) => {
                if (
                  action.attributeId === attribute.id &&
                  action.categoryId.toString() === attribute.value?.toString()
                ) {
                  return {
                    ...attribute,
                    value: null,
                  }
                }

                return attribute
              }),
            }
          }

          return character
        })
      }

      case LOAD_CHARACTERS:
        return action.characters

      case DUPLICATE_CHARACTER: {
        const itemToDuplicate = state.find(({ id }) => id === action.id)
        if (!itemToDuplicate) {
          return state
        }
        const duplicated = {
          ...cloneDeep(itemToDuplicate),
          id: nextId(state),
        }
        return [...state, { ...duplicated }]
      }

      case CREATE_CHARACTER_ATTRIBUTE: {
        return state.map((character) => {
          const attributes = character.attributes || []

          const oldValue =
            DISALLOWED_NAMES.indexOf(action.attribute.name) === -1
              ? character[action.attribute.name]
              : undefined
          const value = action.attribute.value || oldValue

          return {
            ...character,
            attributes: [
              ...attributes,
              {
                value,
                id: action.nextAttributeId,
                bookId: action.bookId || action.currentBookId,
              },
            ],
          }
        })
      }

      case EDIT_CHARACTER_ATTRIBUTE_METADATA: {
        const nextState = state.map((character) => {
          if (!Array.isArray(character.attributes)) {
            return character
          }

          const attributes = character.attributes
          return {
            ...character,
            attributes: attributes.map((attribute) => {
              if (attribute.id === action.id) {
                const newValue =
                  typeof attribute.value === 'undefined'
                    ? attribute.value
                    : action.attributeType === 'text' && typeof attribute.value !== 'string'
                    ? firstParagraphText(attribute.value)
                    : attribute.value
                return {
                  ...attribute,
                  value: newValue,
                }
              }

              return attribute
            }),
          }
        })

        if (!action.id) {
          const { oldName, name } = action
          return nextState.map((character) => {
            if (character[oldName]) {
              return omit(
                {
                  ...character,
                  [name]: character[oldName],
                },
                oldName
              )
            }

            return character
          })
        }

        return nextState
      }

      case EDIT_CHARACTER_CATEGORY:
      case EDIT_CHARACTER_DESCRIPTION:
      case EDIT_CHARACTER_SHORT_DESCRIPTION:
      case EDIT_CHARACTER_ATTRIBUTE_VALUE: {
        return state.map((character) => {
          if (character.id === action.characterId) {
            const attributes = character.attributes || []
            const isAttributeToEdit = (attribute) => {
              return (
                attribute.id === action.attributeId &&
                attribute.bookId === (action.bookId || action.currentBookId)
              )
            }
            const willEditAnAttribute = attributes.some(isAttributeToEdit)

            if (willEditAnAttribute) {
              return {
                ...character,
                attributes: [
                  ...attributes.map((attribute) => {
                    if (isAttributeToEdit(attribute) && typeof action.value !== 'undefined') {
                      return {
                        ...attribute,
                        value: action.value,
                      }
                    }

                    return attribute
                  }),
                ],
              }
            }

            return {
              ...character,
              attributes: [
                ...attributes,
                {
                  bookId: action.bookId || action.currentBookId,
                  id: action.attributeId,
                  value: action.value,
                },
              ],
            }
          }

          return character
        })
      }

      case DELETE_CHARACTER_ATTRIBUTE: {
        return state.map((character) => {
          if (!Array.isArray(character.attributes)) {
            return character
          }

          const attributes = character.attributes || []
          return {
            ...character,
            attributes: attributes.filter((attribute) => {
              return attribute.id !== action.id
            }),
          }
        })
      }

      case DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE: {
        const { attributeName } = action

        return state.map((character) => {
          if (typeof character[attributeName] !== 'undefined') {
            return omit(character, attributeName)
          }
          return character
        })
      }

      default:
        return state
    }
  }

export default characters
