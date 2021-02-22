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
import { positionReset } from '../helpers/lists'
import { nextPositionInBook } from '../helpers/beats'
import { associateWithBroadestScope } from '../helpers/lines'
import { sortBy, partition } from 'lodash'
import { addNode, editNode } from './tree'
import { nextId } from '../helpers/beats'

// bookId is:
// Union of:
//  - bookId: Number,
//  - "series": String literal,

const INITIAL_STATE = [defaultBeat]

const add = addNode('id')

export default function beats(state = INITIAL_STATE, action) {
  const actionBookId = associateWithBroadestScope(action.bookId)

  switch (action.type) {
    case ADD_BEAT: {
      // If we don't get a parent id then make this a root node
      const parentId = action.parentId || null
      const position = nextPositionInBook(state, actionBookId, parentId)
      const node = {
        autoOutlineSort: true,
        bookId: actionBookId,
        fromTemplateId: null,
        id: nextId(state),
        position,
        time: 0,
        title: action.title,
      }
      return {
        ...state,
        [actionBookId]: add(state[actionBookId], parentId, node),
      }
    }

    // TODO: Where should they be added?
    case ADD_LINES_FROM_TEMPLATE: {
      const [_, tNotBook] = partition(state, ({ bookId }) => bookId == actionBookId)
      return [...tNotBook, ...action.beats]
    }

    case EDIT_BEAT_TITLE:
      return {
        ...state,
        [actionBookId]: editNode(state[actionBookId], action.id, { title: action.title }),
      }

    case DELETE_BOOK:
      return state.filter(({ bookId }) => bookId !== action.id)

    case DELETE_BEAT: {
      const [delBook, delNotBook] = partition(state, (beat) => beat.bookId == actionBookId)
      return [
        ...delNotBook,
        ...positionReset(delBook.filter((beat) => beat.id != action.id)), // assumes they are sorted
      ]
    }

    case REORDER_BEATS:
      return [
        ...state.filter(({ bookId }) => bookId != actionBookId),
        ...positionReset(action.beats),
      ]

    case REORDER_CARDS_IN_BEAT:
      return state.map((beat) =>
        beat.id == action.beatId && action.isSeries
          ? Object.assign({}, beat, { autoOutlineSort: false })
          : beat
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
