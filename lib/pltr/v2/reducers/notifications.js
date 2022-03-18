import { SHOW_TOAST_NOTIFICATION } from '../constants/ActionTypes'
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
    default:
      return state
  }
}

export default notificationsReducer
