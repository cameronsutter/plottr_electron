import _ from 'lodash'
import { ADD_SCENE, EDIT_SCENE_TITLE, REORDER_SCENES, DELETE_SCENE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { chapter } from '../../../shared/initialState'
import { newFileChapters } from '../../../shared/newFileState'
import { objectId, objectPosition, objectPositionReset } from 'store/newIds'

const initialState = {allIds: [1], 1: chapter}

export default function chapters (state = initialState, action) {
  let allIds
  switch (action.type) {
    case ADD_SCENE:
      allIds = state.allIds
      const newId = objectId(state.allIds)
      allIds.push(newId)
      return {
        ...state,
        allIds: allIds,
        [newId]: {
          id: newId,
          title: action.title,
          bookId: action.bookId,
          time: 0,
          position: objectPosition(state)
        }
      }

    case EDIT_SCENE_TITLE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          title: action.title
        }
      }

    case DELETE_SCENE:
      // delete in allIds
      allIds = [...state.allIds]
      const index = allIds.indexOf(action.id)
      allIds.splice(index, 0)

      // delete in objects
      const chapters = {...chapters, allIds}
      delete chapters[action.id]
      return chapters

    case REORDER_SCENES:
      // TODO: think about how to do this
      return state
      // return objectPositionReset(action.chapters)

    case RESET:
    case FILE_LOADED:
      return action.data.chapters

    case NEW_FILE:
      return newFileChapters

    default:
      return state
  }
}
