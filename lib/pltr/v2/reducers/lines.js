import { partition, sortBy } from 'lodash'
import { t as i18n } from 'plottr_locales'
import {
  ADD_LINE,
  ADD_LINE_WITH_TITLE,
  ADD_LINES_FROM_TEMPLATE,
  EDIT_LINE_TITLE,
  EXPAND_LINE,
  COLLAPSE_LINE,
  EDIT_LINE,
  EXPAND_TIMELINE,
  COLLAPSE_TIMELINE,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  RESET_TIMELINE,
  EDIT_LINE_COLOR,
  REORDER_LINES,
  DELETE_LINE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
  DELETE_BOOK,
  LOAD_LINES,
} from '../constants/ActionTypes'
import { line } from '../store/initialState'
import { newFileLines, newFileSeriesLines } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { nextColor } from '../store/lineColors'
import { nextPositionInBook, positionReset } from '../helpers/lists'
import { associateWithBroadestScope, isNotSeries } from '../helpers/lines'

const initialState = [...newFileLines, ...newFileSeriesLines]

// bookId is:
// Union of:
//  - bookId: Number,
//  - "series": String literal,

const lines =
  (dataRepairers) =>
  (state = initialState, action) => {
    const actionBookId = associateWithBroadestScope(action.bookId)

    switch (action.type) {
      case ADD_LINE: {
        const linesInBook = state.filter((l) => l.bookId == actionBookId).length
        return [
          {
            id: nextId(state),
            bookId: actionBookId,
            title: '',
            color: nextColor(linesInBook),
            position: nextPositionInBook(state, actionBookId),
            expanded: null,
            fromTemplateId: null,
          },
          ...state,
        ]
      }

      case ADD_LINE_WITH_TITLE: {
        const linesInBook_ = state.filter((l) => l.bookId == actionBookId).length
        return [
          {
            ...line,
            id: nextId(state),
            bookId: actionBookId,
            title: action.title,
            color: nextColor(linesInBook_),
            position: nextPositionInBook(state, actionBookId),
          },
          ...state,
        ]
      }

      case ADD_LINES_FROM_TEMPLATE: {
        const [_, notBook] = partition(state, (l) => l.bookId == actionBookId)
        return [...notBook, ...action.lines]
      }

      case EDIT_LINE:
        return state.map((l) =>
          l.id === action.id
            ? Object.assign({}, l, { title: action.title, color: action.color })
            : l
        )

      case EDIT_LINE_TITLE:
        return state.map((l) =>
          l.id === action.id ? Object.assign({}, l, { title: action.title }) : l
        )

      case EDIT_LINE_COLOR:
        return state.map((l) =>
          l.id === action.id ? Object.assign({}, l, { color: action.color }) : l
        )

      case DELETE_BOOK:
        return state.filter(({ bookId }) => bookId !== action.id)

      case DELETE_LINE:
        return state.filter((l) => l.id !== action.id)

      case REORDER_LINES:
        return [
          ...state.filter((l) => l && l.bookId != actionBookId),
          ...positionReset(action.lines),
        ]

      case EXPAND_LINE:
        return state.map((l) => (l.id === action.id ? Object.assign({}, l, { expanded: true }) : l))

      case COLLAPSE_LINE:
        return state.map((l) =>
          l.id === action.id ? Object.assign({}, l, { expanded: false }) : l
        )

      case COLLAPSE_TIMELINE:
      case EXPAND_TIMELINE:
        return state.map((l) => Object.assign({}, l, { expanded: null }))

      case CLEAR_TEMPLATE_FROM_TIMELINE: {
        const values = state.reduce(
          (acc, line) => {
            if (line.bookId == actionBookId) {
              if (line.fromTemplateId != action.templateId) acc.book.push(line)
            } else {
              acc.notBook.push(line)
            }
            return acc
          },
          { book: [], notBook: [] }
        )
        const bookLines = positionReset(sortBy(values.book, 'position'))
        return values.notBook.concat(bookLines)
      }

      case RESET_TIMELINE: {
        // remove any from this book
        const linesToKeep = action.isSeries
          ? state.filter(isNotSeries)
          : state.filter((line) => line.bookId != actionBookId)
        // create a new line in the book so there's 1
        return [
          {
            id: nextId(state),
            bookId: actionBookId,
            title: i18n('Main Plot'),
            color: nextColor(0),
            position: 0,
            expanded: null,
            fromTemplateId: null,
          },
          ...linesToKeep,
        ]
      }

      case RESET:
      case FILE_LOADED:
        return action.data.lines

      case NEW_FILE:
        return newFileLines

      case LOAD_LINES:
        return action.lines

      default:
        return state
    }
  }

export default lines
