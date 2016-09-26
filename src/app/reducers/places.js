import { ADD_PLACE, EDIT_PLACE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { place } from 'store/initialState'
import { placeId } from 'store/newIds'

const initialState = [place]

export default function places (state = initialState, action) {
  switch (action.type) {
    case ADD_PLACE:
      return [...state, {
        id: placeId(state),
        name: action.name,
        description: action.description,
        notes: action.notes,
        place: place.color
      }]

    case EDIT_PLACE:
      return state.map(place =>
        place.id === action.id ? Object.assign({}, place, {name: action.name, description: action.description, notes: action.notes, color: action.color}) : place
      )

    case RESET:
    case FILE_LOADED:
      return action.data.places

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}
