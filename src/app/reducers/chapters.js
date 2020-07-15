import { partition } from 'lodash'
import { ADD_SCENE, ADD_LINES_FROM_TEMPLATE, EDIT_SCENE_TITLE, REORDER_SCENES, REORDER_CARDS_IN_CHAPTER,
  AUTO_SORT_CHAPTER, DELETE_SCENE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { chapter } from '../../../shared/initialState'
import { newFileChapters } from '../../../shared/newFileState'
import { nextId } from '../store/newIds'
import { nextPositionInBook, positionReset } from '../helpers/lists'

const initialState = [chapter]

export default function chapters (state = initialState, action) {
  switch (action.type) {
    case ADD_SCENE:
      return [...state, {
        id: nextId(state),
        bookId: action.bookId,
        position: nextPositionInBook(state, action.bookId),
        title: action.title,
        time: 0,
      }]

    case ADD_LINES_FROM_TEMPLATE:
      const [tBook, tNotBook] = partition(state, ch => ch.bookId == action.bookId)
      return [...tNotBook, ...action.chapters]

    case EDIT_SCENE_TITLE:
      return state.map(ch => ch.id == action.id ? Object.assign({}, ch, {title: action.title}) : ch )

    case DELETE_SCENE:
      const [delBook, delNotBook] = partition(state, ch => ch.bookId == action.bookId)
      return [
        ...delNotBook,
        ...positionReset(delBook.filter(ch => ch.id != action.id)), // assumes they are sorted
      ]

    case REORDER_SCENES:
      return [
        ...state.filter(ch => ch.bookId != action.bookId),
        ...positionReset(action.chapters),
      ]

    case REORDER_CARDS_IN_CHAPTER:
      return state.map(ch => ch.id == action.chapterId ? Object.assign({}, ch, {autoOutlineSort: false}) : ch )

    case AUTO_SORT_CHAPTER:
      return state.map(ch => ch.id == action.id ? Object.assign({}, ch, {autoOutlineSort: true}) : ch )

    case RESET:
    case FILE_LOADED:
      return action.data.chapters

    case NEW_FILE:
      return newFileChapters

    default:
      return state
  }
}
