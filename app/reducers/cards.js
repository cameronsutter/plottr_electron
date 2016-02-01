import { ADD_CARD, EDIT_CARD_DETAILS,
  DELETE_LINE, DELETE_SCENE,
  EDIT_CARD_COORDINATES, DELETE_CARD, FILE_LOADED, NEW_FILE } from '../constants/ActionTypes'

import { card } from 'store/initialState'

const initialState = [card]

export default function cards (state = initialState, action) {
  switch (action.type) {
    case ADD_CARD:
      return [{
        id: state.reduce((maxId, card) => Math.max(card.id, maxId), -1) + 1,
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

    case FILE_LOADED:
      return action.data.cards

    case NEW_FILE:
      return initialState

    default:
      return state
  }
}
