import { CREATE_CHARACTER_ATTRIBUTE } from '../constants/ActionTypes'

const INITIAL_STATE = []

const attributesReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CREATE_CHARACTER_ATTRIBUTE: {
      return [...state, { bookId: action.bookId, id: action.characterId }]
    }

    default: {
      return state
    }
  }
}

export default attributesReducer
