import { DISMISS_MESSAGE, SHOW_MESSAGE, SHOW_TOAST_NOTIFICATION } from '../constants/ActionTypes'
import { notifications } from '../store/initialState'

const INITIAL_STATE = notifications

const notificationsReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SHOW_TOAST_NOTIFICATION: {
      const { visible, cardAction, newBookId } = action

      return {
        ...state,
        toast: {
          cardAction,
          newBookId,
          visible,
        },
      }
    }
    case SHOW_MESSAGE: {
      const { message } = action
      return {
        ...state,
        message,
      }
    }
    case DISMISS_MESSAGE: {
      return {
        ...state,
        message: null,
      }
    }
    default:
      return state
  }
}

export default notificationsReducer
