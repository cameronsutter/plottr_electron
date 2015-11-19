import { ADD_PLACE, EDIT_PLACE_NAME, EDIT_PLACE_DESCRIPTION, FILE_LOADED } from '../constants/ActionTypes'

const initialState = [{
  id: 0,
  name: '',
  description: ''
}]

export default function places (state = initialState, action) {
  switch (action.type) {
    case ADD_PLACE:
      return [{
        id: state.reduce((maxId, place) => Math.max(place.id, maxId), -1) + 1,
        name: action.name,
        description: action.description
      }, ...state]

    case EDIT_PLACE_NAME:
      return state.map(place =>
        place.id === action.id ? Object.assign({}, place, {name: action.name}) : place
      )

    case EDIT_PLACE_DESCRIPTION:
      return state.map(place =>
        place.id === action.id ? Object.assign({}, place, {description: action.description}) : place
      )

    case FILE_LOADED:
      return action.data.places

    default:
      return state
  }
}
