import { ADD_CARD, EDIT_CARD_DETAILS,
  DELETE_LINE, DELETE_SCENE,
  EDIT_CARD_COORDINATES, CHANGE_LINE, CHANGE_SCENE,
  DELETE_CARD, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { card } from 'store/initialState'
import { newFileCards } from 'store/newFileState'
import { cardId } from 'store/newIds'

const initialState = [card]

export default function cards (state, action) {
  switch (action.type) {
    case ADD_CARD:
      return [{
        id: cardId(state),
        lineId: action.card.lineId,
        sceneId: action.card.sceneId,
        title: action.card.title,
        description: action.card.description,
        tags: action.card.tags,
        characters: action.card.characters,
        places: action.card.places
      }, ...state]

    case EDIT_CARD_DETAILS:
      var newCardDetails = {
        title: action.title,
        description: action.description,
        characters: action.characters,
        places: action.places,
        tags: action.tags
      }
      return state.map(card =>
        card.id === action.id ? Object.assign({}, card, newCardDetails) : card
      )

    case EDIT_CARD_COORDINATES:
      return state.map(card =>
        card.id === action.id ? Object.assign({}, card, {lineId: action.lineId, sceneId: action.sceneId}) : card
      )

    case CHANGE_LINE:
      return state.map(card =>
        card.id === action.id ? Object.assign({}, card, {lineId: action.lineId}) : card
      )

    case CHANGE_SCENE:
      return state.map(card =>
        card.id === action.id ? Object.assign({}, card, {sceneId: action.sceneId}) : card
      )

    case DELETE_CARD:
      return state.filter(card =>
        card.id !== action.id
      )

    case DELETE_SCENE:
      return state.filter(card =>
        card.sceneId !== action.id
      )

    case DELETE_LINE:
      return state.filter(card =>
        card.lineId !== action.id
      )

    case RESET:
    case FILE_LOADED:
      return action.data.cards

    case NEW_FILE:
      return newFileCards

    default:
      return state || []
  }
}
