import { ADD_CHAPTER, EDIT_CHAPTER_TITLE, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { chapter } from 'store/initialState'

const initialState = [chapter]

export default function chapters (state = initialState, action) {
  switch (action.type) {
    case ADD_CHAPTER:
      return [{
        id: state.reduce((maxId, chapter) => Math.max(chapter.id, maxId), -1) + 1,
        title: action.title
      }, ...state]

    case EDIT_CHAPTER_TITLE:
      return state.map(chapter =>
        chapter.id === action.id ? Object.assign({}, chapter, {title: action.title}) : chapter
      )

    case FILE_LOADED:
      return action.data.chapters

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}
