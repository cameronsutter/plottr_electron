import {
  SET_USER_ID,
  SET_CLIENT_ID,
  SET_EMAIL_ADDRESS,
  SET_HAS_PRO,
} from '../constants/ActionTypes'

const INITIAL_STATE = {
  userId: null,
  clientId: null,
  emailAddress: null,
  hasPro: null,
}

const clientReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_USER_ID:
      return {
        ...state,
        userId: action.userId,
      }
    case SET_CLIENT_ID:
      return {
        ...state,
        clientId: action.clientId,
      }
    case SET_EMAIL_ADDRESS:
      return {
        ...state,
        emailAddress: action.emailAddress,
      }
    case SET_HAS_PRO:
      return {
        ...state,
        hasPro: action.hasPro,
      }
    default:
      return state
  }
}

export default clientReducer
