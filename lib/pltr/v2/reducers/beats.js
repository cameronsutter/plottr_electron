import {
  ADD_LINES_FROM_TEMPLATE,
  ADD_BEAT,
  AUTO_SORT_BEAT,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  DELETE_BEAT,
  EDIT_BEAT_TITLE,
  FILE_LOADED,
  NEW_FILE,
  REORDER_BEATS,
  REORDER_CARDS_IN_BEAT,
  RESET,
  RESET_TIMELINE,
  DELETE_BOOK,
} from '../constants/ActionTypes'
import { beat as defaultBeat } from '../store/initialState'
import { newFileBeats } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { nextPositionInBook, positionReset, closeGap } from '../helpers/lists'
import { associateWithBroadestScope } from '../helpers/lines'
import { sortBy, partition } from 'lodash'

// bookId is:
// Union of:
//  - bookId: Number,
//  - "series": String literal,

const INITIAL_STATE = [defaultBeat]

export function deleteBeat(beats, beatId, bookId) {
  const [delBook, delNotBook] = partition(beats, (beat) => beat.bookId == bookId)
  return [...delNotBook, ...closeGap(delBook.filter((beat) => beat.id != beatId))]
}

export default function beats(state = INITIAL_STATE, action) {
  const actionBookId = associateWithBroadestScope(action.bookId)

  switch (action.type) {
    case ADD_BEAT:
      return [
        {
          autoOutlineSort: true,
          bookId: actionBookId,
          fromTemplateId: null,
          id: nextId(state),
          position: nextPositionInBook(state, actionBookId),
          time: 0,
          title: action.title,
        },
        ...state,
      ]

    case ADD_LINES_FROM_TEMPLATE: {
      const [_, tNotBook] = partition(state, ({ bookId }) => bookId == actionBookId)
      return [...tNotBook, ...action.beats]
    }

    case EDIT_BEAT_TITLE:
      return state.map((beat) =>
        beat.id == action.id ? Object.assign({}, beat, { title: action.title }) : beat
      )

    case DELETE_BOOK:
      return state.filter(({ bookId }) => bookId !== action.id)

    case DELETE_BEAT: {
      return deleteBeat(state, action.id, actionBookId)
    }

    case REORDER_BEATS:
      return [
        ...state.filter(({ bookId }) => bookId != actionBookId),
        ...positionReset(action.beats),
      ]

    case REORDER_CARDS_IN_BEAT:
      return state.map((beat) =>
        beat.id == action.beatId ? Object.assign({}, beat, { autoOutlineSort: false }) : beat
      )

    case AUTO_SORT_BEAT:
      return state.map((beat) =>
        beat.id == action.id ? Object.assign({}, beat, { autoOutlineSort: true }) : beat
      )

    case CLEAR_TEMPLATE_FROM_TIMELINE: {
      const values = state.reduce(
        (acc, beat) => {
          if (beat.bookId == actionBookId) {
            if (beat.fromTemplateId != action.templateId) acc.book.push(beat)
          } else {
            acc.notBook.push(beat)
          }
          return acc
        },
        { book: [], notBook: [] }
      )
      const bookBeats = positionReset(sortBy(values.book, 'position'))
      return values.notBook.concat(bookBeats)
    }

    case RESET_TIMELINE: {
      // remove any from this book
      const beatsToKeep = state.filter((beat) => beat.bookId != actionBookId)
      // create a new beat in the book so there's 1
      return [
        ...beatsToKeep,
        {
          id: nextId(beatsToKeep),
          bookId: actionBookId,
          position: 0,
          title: 'auto',
          time: 0,
          autoOutlineSort: true,
          fromTemplateId: null,
        },
      ]
    }

    case RESET:
    case FILE_LOADED:
      return action.data.beats

    case NEW_FILE:
      return newFileBeats

    default:
      return state
  }
}
