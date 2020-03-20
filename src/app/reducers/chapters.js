import _ from 'lodash'
import { ADD_SCENE, EDIT_SCENE_TITLE, REORDER_SCENES, DELETE_SCENE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { chapter } from '../../../shared/initialState'
import { newFileChapters } from '../../../shared/newFileState'
import { nextId } from 'store/newIds'
import { nextPositionInBook, positionReset } from '../helpers/lists'

const initialState = [chapter]

export default function chapters (state = initialState, action) {
  switch (action.type) {
    case ADD_SCENE:
      return [{
        id: nextId(state),
        title: action.title,
        bookId: action.bookId,
        time: 0,
        position: nextPositionInBook(state, action.bookId)
      }, ...state]

    case EDIT_SCENE_TITLE:
      return state.map(ch =>
        ch.id == action.id ? Object.assign({}, ch, {title: action.title}) : ch
      )

    case DELETE_SCENE:
      const [book, notBook] = _.partition(state, ch => ch.bookId == action.bookId)
      return [
        ...notBook,
        ...positionReset(book.filter(ch => ch.id != action.id)),
      ]

    case REORDER_SCENES:
      return [
        ...state.filter(ch => ch.bookId != action.bookId),
        ...positionReset(action.chapters),
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
