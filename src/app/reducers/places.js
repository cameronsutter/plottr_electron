import { ADD_PLACE, EDIT_PLACE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { place } from 'store/initialState'
import { newFilePlaces } from 'store/newFileState'
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
        color: place.color
      }]

    case EDIT_PLACE:
      return state.map(place =>
        place.id === action.id ? Object.assign({}, place, action.attributes) : place
      )

    case RESET:
    case FILE_LOADED:
      return action.data.places

    case NEW_FILE:
      return newFilePlaces

    default:
      return state
  }
}
