import _ from 'lodash'
import { ADD_SCENE, EDIT_SCENE_TITLE, REORDER_SCENES, DELETE_SCENE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { chapter } from '../../../shared/initialState'
import { newFileChapters } from '../../../shared/newFileState'
import { arrayId, arrayPosition, positionReset } from 'store/newIds'

const initialState = [chapter]

export default function chapters (state = initialState, action) {
  switch (action.type) {
    case ADD_SCENE:
      return [{
        id: arrayId(state),
        title: action.title,
        bookId: action.bookId,
        time: 0,
        position: arrayPosition(state)
      }, ...state]

    case EDIT_SCENE_TITLE:
      return state.map(ch =>
        ch.id == action.id ? Object.assign({}, ch, {title: action.title}) : ch
      )

    case DELETE_SCENE:
      let chapters = state.filter(ch =>
        ch.id !== action.id
      )
      let newChapters = _.sortBy(chapters, 'position')
      newChapters.forEach((ch, idx) =>
        ch['position'] = idx
      )
      return newChapters

    case REORDER_SCENES:
      return positionReset(action.chapters)

    case RESET:
    case FILE_LOADED:
      return action.data.chapters

    case NEW_FILE:
      return newFileChapters

    default:
      return state
  }
}
