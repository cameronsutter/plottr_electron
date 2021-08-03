import unrepairedMainReducer from './main'
import {
  DELETE_BOOK,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  RESET_TIMELINE,
  ADD_BOOK_FROM_TEMPLATE,
  ADD_LINES_FROM_TEMPLATE,
} from '../constants/ActionTypes'
import { isSeriesSelector } from '../selectors/ui'
import { reduce, beatsByPosition, nextId as nextBeatId } from '../helpers/beats'
import { nextId, objectId } from '../store/newIds'
import * as tree from './tree'
import { beat as defaultBeat } from '../store/initialState'
import { cloneDeep } from 'lodash'

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
  const mainReducer = unrepairedMainReducer(dataRepairers)
  switch (action.type) {
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
        currentTree: beatTree,
        cardToBeatIdMap: cardToBeatIdMap,
      })
    }

    case DELETE_BOOK:
      if (state.ui.currentTimeline == action.id) {
        const nextBookId = state.books.allIds.find((id) => id != action.id)
        let newState = { ...state }
        newState.ui.currentTimeline = nextBookId
        return mainReducer(newState, action)
      } else {
        return mainReducer(state, action)
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

    default:
      return mainReducer(state, action)
  }
}

export default root
