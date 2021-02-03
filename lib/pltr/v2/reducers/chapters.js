import { partition, sortBy } from 'lodash'
import {
  ADD_SCENE,
  ADD_LINES_FROM_TEMPLATE,
  EDIT_SCENE_TITLE,
  REORDER_SCENES,
  REORDER_CARDS_IN_CHAPTER,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  RESET_TIMELINE,
  AUTO_SORT_CHAPTER,
  DELETE_SCENE,
  FILE_LOADED,
  NEW_FILE,
  RESET,
} from '../constants/ActionTypes'
import { chapter } from '../store/initialState'
import { newFileChapters } from '../store/newFileState'
import { nextId } from '../store/newIds'
import { nextPositionInBook, positionReset } from '../helpers/lists'

const initialState = [chapter]

export default function chapters(state = initialState, action) {
  switch (action.type) {
    case ADD_SCENE:
      return [
        ...state,
        {
          id: nextId(state),
          bookId: action.bookId,
          position: nextPositionInBook(state, action.bookId),
          title: action.title,
          time: 0,
          autoOutlineSort: true,
          fromTemplateId: null,
        },
      ]

    case ADD_LINES_FROM_TEMPLATE:
      const [_, tNotBook] = partition(state, (ch) => ch.bookId == action.bookId)
      return [...tNotBook, ...action.chapters]

    case EDIT_SCENE_TITLE:
      return state.map((ch) =>
        ch.id == action.id ? Object.assign({}, ch, { title: action.title }) : ch
      )

    case DELETE_SCENE:
      const [delBook, delNotBook] = partition(state, (ch) => ch.bookId == action.bookId)
      return [
        ...delNotBook,
        ...positionReset(delBook.filter((ch) => ch.id != action.id)), // assumes they are sorted
      ]

    case REORDER_SCENES:
      return [
        ...state.filter((ch) => ch.bookId != action.bookId),
        ...positionReset(action.chapters),
      ]

    case REORDER_CARDS_IN_CHAPTER:
      return state.map((ch) =>
        ch.id == action.chapterId && !action.isSeries
          ? Object.assign({}, ch, { autoOutlineSort: false })
          : ch
      )

    case AUTO_SORT_CHAPTER:
      return state.map((ch) =>
        ch.id == action.id ? Object.assign({}, ch, { autoOutlineSort: true }) : ch
      )

    case CLEAR_TEMPLATE_FROM_TIMELINE:
      const values = state.reduce(
        (acc, ch) => {
          if (ch.bookId == action.bookId) {
            if (ch.fromTemplateId != action.templateId) acc.book.push(ch)
          } else {
            acc.notBook.push(ch)
          }
          return acc
        },
        { book: [], notBook: [] }
      )
      const bookChapters = positionReset(sortBy(values.book, 'position'))
      return values.notBook.concat(bookChapters)

    case RESET_TIMELINE:
      if (action.isSeries) return state

      // remove any from this book
      const chaptersToKeep = state.filter((line) => line.bookId != action.bookId)
      // create a new chapter in the book so there's 1
      return [
        ...chaptersToKeep,
        {
          id: nextId(state),
          bookId: action.bookId,
          position: 0,
          title: 'auto',
          time: 0,
          autoOutlineSort: true,
          fromTemplateId: null,
        },
      ]

    case RESET:
    case FILE_LOADED:
      return action.data.chapters

    case NEW_FILE:
      return newFileChapters

    default:
      return state
  }
}
