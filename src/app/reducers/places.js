import { ADD_PLACE, EDIT_PLACE, FILE_LOADED, NEW_FILE, RESET,
  ADD_PLACE_TO_CARD, REMOVE_PLACE_FROM_CARD } from '../constants/ActionTypes'
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

    case ADD_PLACE_TO_CARD:
      return state.map(place => {
        let cards = _.cloneDeep(place.cards)
        cards.push(action.id)
        return place.id === action.placeId ? Object.assign({}, place, {cards: cards}) : place
      })

    case REMOVE_PLACE_FROM_CARD:
      return state.map(place => {
        let cards = _.cloneDeep(place.cards)
        cards.splice(cards.indexOf(action.id), 1)
        return place.id === action.placeId ? Object.assign({}, place, {cards: cards}) : place
      })

    case RESET:
    case FILE_LOADED:
      return action.data.places

    case NEW_FILE:
      return newFilePlaces

    default:
      return state
  }
}
