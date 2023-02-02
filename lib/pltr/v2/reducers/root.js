import unrepairedMainReducer from './main'
import {
  ADD_BOOK,
  DELETE_BOOK,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  RESET_TIMELINE,
  ADD_BOOK_FROM_TEMPLATE,
  ADD_LINES_FROM_TEMPLATE,
  MOVE_CARD_TO_BOOK,
  DUPLICATE_LINE,
  MOVE_LINE,
  ADD_BEAT,
  INSERT_BEAT,
  DELETE_BEAT,
  CREATE_CHARACTER_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_VALUE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  DELETE_CHARACTER_ATTRIBUTE,
  REORDER_CHARACTER_ATTRIBUTE_METADATA,
  ATTACH_TAG_TO_CHARACTER,
  REMOVE_TAG_FROM_CHARACTER,
  EDIT_CHARACTER_SHORT_DESCRIPTION,
  EDIT_CHARACTER_DESCRIPTION,
  EDIT_CHARACTER_CATEGORY,
  DELETE_CHARACTER_CATEGORY,
  ADD_CHARACTER,
  APPLY_TIMELINE_TEMPLATE,
  SET_HIERARCHY_LEVELS,
} from '../constants/ActionTypes'
import { selectedCharacterAttributeTabSelector, isSeriesSelector } from '../selectors'
import { reduce, beatsByPosition, nextId as nextBeatId } from '../helpers/beats'
import { nextId, objectId } from '../store/newIds'
import * as tree from './tree'
import { beat as defaultBeat } from '../store/initialState'
import { cloneDeep } from 'lodash'
import { firstLineForBookSelector } from '../selectors'
import { timelineViewIsTabbedSelector, currentTimelineSelector } from '../selectors'
import {
  firstVisibleBeatForBookSelector,
  timelineTabBeatIdsSelector,
  timelineActiveTabSelector,
} from '../selectors'
import { setTimelineView } from '../actions/ui'
import { deleteLine } from '../actions/lines'
import {
  characterAttributesForBookSelector,
  characterAttributsForBookByIdSelector,
} from '../selectors'
import { permissionSelector } from '../selectors'
import { ATTACH_CHARACTER_TO_CARD, DELETE_TAG } from '../../v1/constants/ActionTypes'
import { userIdSelector } from '../selectors'
import { shouldBeInProSelector } from '../selectors'
import { applyTemplate, moveLineActions } from '../helpers/templates'
import { hierarchyLevelCount } from '../selectors/secondOrder'

const addCharacterAttributeDataForModifyingBaseAttribute = (baseAttributeName, state, action) => {
  const currentBookId = selectedCharacterAttributeTabSelector(state)
  const characterAttributes = characterAttributesForBookSelector(state)
  const nextAttributeId = nextId(characterAttributes)
  const availableAttributes = characterAttributsForBookByIdSelector(state)
  const isThisTypeOfBaseAttribute = (attribute) => {
    return attribute.type === 'base-attribute' && attribute.name === baseAttributeName
  }
  const existingBookAttribute = Object.values(availableAttributes).find(isThisTypeOfBaseAttribute)
  const attributeId = existingBookAttribute?.id || nextAttributeId
  return {
    ...action,
    currentBookId,
    attributeId,
  }
}

const addPermission = (reducer) => {
  return (state, action) => {
    return reducer(state, {
      ...action,
      currentPermission: state && permissionSelector(state),
      currentUserId: state && userIdSelector(state),
      currentlyShouldBeLoggedIn: state && shouldBeInProSelector(state),
    })
  }
}

/**
 * `dataRepairers` is an object which contains various repairs to be
 * made to the data that's loaded from files.  We have it here because
 * often we make fixes to the application which we can't apply to
 * files in the wild.  The best we can do is make sure that the
 * problems are fixed when we load the file into the application.
 * It's the responsibility of each reducer to use applicable data
 * repairers to fix pieces of data which they apply to.
 *
 * The schema of the object is as follows:
 * {
 *   normalizeRCEContent: RCEContent => RCEContent
 * }
 */
const root = (dataRepairers) => (state, action) => {
  const isSeries = action.type.includes('@@') ? false : isSeriesSelector(state)
  const mainReducer = addPermission(unrepairedMainReducer(dataRepairers))
  switch (action.type) {
    case APPLY_TIMELINE_TEMPLATE: {
      return applyTemplate(state, action.bookId, action.template, action.selectedIndex)
    }

    case ATTACH_CHARACTER_TO_CARD: {
      const currentTimeline = currentTimelineSelector(state)
      return mainReducer(state, {
        ...action,
        currentTimeline,
      })
    }
    case ADD_CHARACTER: {
      const currentBookId = selectedCharacterAttributeTabSelector(state)
      return mainReducer(state, {
        ...action,
        currentBookId,
      })
    }
    // We might need to mint the books attribute when attaching a book
    // to a character.
    case EDIT_CHARACTER_CATEGORY:
    case DELETE_CHARACTER_CATEGORY: {
      const newAction = addCharacterAttributeDataForModifyingBaseAttribute(
        'category',
        state,
        action
      )
      return mainReducer(state, newAction)
    }
    case EDIT_CHARACTER_DESCRIPTION: {
      const newAction = addCharacterAttributeDataForModifyingBaseAttribute(
        'description',
        state,
        action
      )
      return mainReducer(state, newAction)
    }
    case EDIT_CHARACTER_SHORT_DESCRIPTION: {
      const newAction = addCharacterAttributeDataForModifyingBaseAttribute(
        'shortDescription',
        state,
        action
      )
      return mainReducer(state, newAction)
    }
    case ATTACH_TAG_TO_CHARACTER:
    case REMOVE_TAG_FROM_CHARACTER:
    case DELETE_TAG: {
      const newAction = addCharacterAttributeDataForModifyingBaseAttribute('tags', state, action)
      return mainReducer(state, newAction)
    }
    // Actions for new attributes need the current book.
    case REORDER_CHARACTER_ATTRIBUTE_METADATA:
    case DELETE_CHARACTER_ATTRIBUTE:
    case EDIT_CHARACTER_ATTRIBUTE_METADATA:
    case EDIT_CHARACTER_ATTRIBUTE_VALUE:
    case CREATE_CHARACTER_ATTRIBUTE: {
      const bookId = selectedCharacterAttributeTabSelector(state)
      const characterAttributes = characterAttributesForBookSelector(state)
      const nextAttributeId = nextId(characterAttributes)
      const newAction = {
        ...action,
        bookId,
        nextAttributeId,
      }
      return mainReducer(state, newAction)
    }
    case DELETE_BEAT: {
      const topLevelbeatIds = timelineTabBeatIdsSelector(state)
      const position = topLevelbeatIds.indexOf(action.id)
      if (position !== -1) {
        if (topLevelbeatIds.length > 1) {
          if (position === 0) {
            return mainReducer(state, { ...action, actTab: topLevelbeatIds[1] })
          } else {
            return mainReducer(state, { ...action, actTab: topLevelbeatIds[position - 1] })
          }
        } else {
          const withDefaultView = mainReducer(state, setTimelineView('default'))
          return mainReducer(withDefaultView, { ...action, actTab: topLevelbeatIds[position - 1] })
        }
      }
      return mainReducer(state, action)
    }

    case INSERT_BEAT: {
      const timelineViewIsTabbed = timelineViewIsTabbedSelector(state)
      if (timelineViewIsTabbed) {
        const activeParentId = timelineActiveTabSelector(state)
        return mainReducer(state, { ...action, parentId: activeParentId })
      }
      return mainReducer(state, action)
    }

    case ADD_BOOK:
      return mainReducer(state, { ...action, newBookId: objectId(state.books.allIds) })

    case ADD_BOOK_FROM_TEMPLATE:
      // cards from the template need to know the new ids of lines and beats from the template
      // the strategy here is to use the state's next id value + the template id's current value
      // the card reducer will have access to the state's next id value so it will be able to determine the correct id
      return mainReducer(state, {
        ...action,
        newBookId: objectId(state.books.allIds),
        nextLineId: nextId(state.lines),
        nextBeatId: nextBeatId(state.beats),
        nextCardId: nextId(state.cards),
      })

    case MOVE_CARD_TO_BOOK: {
      const destinationLineId = firstLineForBookSelector(state, action.bookId).id
      const destinationBeatId = firstVisibleBeatForBookSelector(state, action.bookId).id

      const newAction = {
        ...action,
        destinationLineId,
        destinationBeatId,
      }

      return mainReducer(state, newAction)
    }

    case DUPLICATE_LINE: {
      const newLineId = nextId(state.lines)
      const newAction = {
        ...action,
        newLineId,
      }

      return mainReducer(state, newAction)
    }

    case ADD_LINES_FROM_TEMPLATE: {
      // cards from the template need to know the new ids of lines (and sometimes beats) from the template
      // FOR LINES:
      // the strategy here is to use the state's next id value + the template id's current value
      // the card reducer will have access to the state's next id value so it will be able to determine the correct id
      // FOR BEATS:
      // cards will use the cardToBeatIdMap to use the current book's beat ids
      // but if more beats are needed, they will be created with subsequent ids
      const bookId = state.ui.currentTimeline
      let nextIdForBeats = nextBeatId(state.beats)
      let beatTree = cloneDeep(state.beats[bookId])
      let createdNewBeats = false
      // make a card -> beatId mapping (beatId is from existing beats … augmented with new ones)
      const beatPositions = beatsByPosition(() => true)(beatTree).map(({ id }) => id)
      const cardToBeatIdMap = action.templateData.cards.reduce((acc, card) => {
        const beat = tree.findNode(action.templateData.beats['1'], card.beatId)
        if (beatPositions[beat.position]) {
          // a beat in that position exists, so use it's id
          acc[card.id] = beatPositions[beat.position]
        } else {
          // a beat doesn't exist in that position, so create it
          const nextBeat = {
            ...defaultBeat,
            bookId: bookId,
            id: ++nextIdForBeats,
            position: beat.position,
          }
          beatTree = tree.addNode('id')(beatTree, null, nextBeat)
          createdNewBeats = true
          acc[card.id] = nextIdForBeats
        }
        return acc
      }, {})

      return mainReducer(state, {
        ...action,
        bookId: bookId,
        nextLineId: nextId(state.lines),
        nextBeatId: ++nextIdForBeats,
        nextCardId: nextId(state.cards),
        createdNewBeats: createdNewBeats,
        newTree: beatTree,
        cardToBeatIdMap: cardToBeatIdMap,
      })
    }

    case DELETE_BOOK: {
      const linesToDelete = state.lines.filter((l) => l.bookId == action.id).map((l) => l.id)
      const newAction = {
        ...action,
        linesToDelete: linesToDelete,
      }
      if (state.ui.currentTimeline == action.id) {
        const nextBookId = state.books.allIds.find((id) => id != action.id)
        let newState = { ...state }
        newState.ui.currentTimeline = nextBookId
        return mainReducer(newState, newAction)
      } else {
        return mainReducer(state, newAction)
      }
    }

    case CLEAR_TEMPLATE_FROM_TIMELINE: {
      // finding beats that will NOT be removed
      const beatIdsToClear = reduce(
        state.beats,
        (acc, beat) => {
          if (beat.bookId != action.bookId || beat.fromTemplateId != action.templateId) {
            acc[beat.id] = true
          }
          return acc
        },
        {}
      )
      // finding lines that will NOT be removed
      const lineIdsToClear = state.lines.reduce((acc, l) => {
        if (l.bookId != action.bookId || l.fromTemplateId != action.templateId) {
          acc[l.id] = true
        }
        return acc
      }, {})
      const newClearAction = { ...action, beatIds: beatIdsToClear, lineIds: lineIdsToClear }
      return mainReducer(state, newClearAction)
    }

    case RESET_TIMELINE: {
      let newResetAction = { ...action, isSeries }
      // finding beats that will NOT be removed
      const beatIdsToReset = reduce(
        state.beats,
        (acc, beat) => {
          if (beat.bookId != action.bookId) {
            acc[beat.id] = true
          }
          return acc
        },
        {}
      )
      // finding lines that will NOT be removed
      const lineIdsToReset = state.lines.reduce((acc, l) => {
        if (l.bookId != action.bookId) {
          acc[l.id] = true
        }
        return acc
      }, {})
      newResetAction = {
        ...newResetAction,
        beatIds: beatIdsToReset,
        lineIds: lineIdsToReset,
      }
      return mainReducer(state, newResetAction)
    }

    case MOVE_LINE: {
      const line = state.lines.find((line) => {
        return line.id === action.id
      })
      // No such line or book
      if (!line || typeof state.books[action.destinationBookId] === 'undefined') {
        return state
      }

      const sourceBookId = line.bookId
      if (typeof state.books[line.bookId] === 'undefined') {
        return state
      }

      if (sourceBookId === action.destinationBookId) {
        return state
      }

      const sourceLevelsOfHierarchy = Object.values(state.hierarchyLevels[sourceBookId]).length
      const destinationLevelsOfHierarchy = Object.values(
        state.hierarchyLevels[action.destinationBookId]
      ).length
      // We don't move lines between books with different levels of hierarchy.
      if (sourceLevelsOfHierarchy !== destinationLevelsOfHierarchy) {
        return state
      }

      const createLineBeatsAndCardsActions = moveLineActions(
        state,
        action.id,
        action.destinationBookId
      )

      // Add the new line
      const withNewLine = createLineBeatsAndCardsActions.reduce((accState, nextAction) => {
        return mainReducer(accState, nextAction)
      }, state)

      // Remove the old line & cards
      return mainReducer(withNewLine, deleteLine(action.id))
    }

    case SET_HIERARCHY_LEVELS: {
      return mainReducer(state, {
        ...action,
        existingHierarchyLevelCount: hierarchyLevelCount(state),
      })
    }

    default:
      return mainReducer(state, action)
  }
}

export default root
