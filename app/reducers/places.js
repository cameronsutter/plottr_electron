import { ADD_PLACE, EDIT_PLACE, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'
import { place } from 'store/initialState'

const initialState = [place]

export default function places (state = initialState, action) {
  switch (action.type) {
    case ADD_PLACE:
      return [{
        id: state.reduce((maxId, place) => Math.max(place.id, maxId), -1) + 1,
        name: action.name,
        description: action.description
      }, ...state]

    case EDIT_PLACE:
      return state.map(place =>
        place.id === action.id ? Object.assign({}, place, {name: action.name, description: action.description}) : place
      )

    case FILE_LOADED:
      return action.data.places

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}
