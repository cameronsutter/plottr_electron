import { CLICK_ON_DOM } from '../constants/ActionTypes'

const INITIAL_STATE = {
  lastClick: {
    x: null,
    y: null,
    counter: 0,
  },
}

const domEvents = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CLICK_ON_DOM: {
      return {
        ...state,
        lastClick: {
          x: action.x,
          y: action.y,
          counter: state.lastClick.counter + 1,
        },
      }
    }
    default:
      return state
  }
}

export default domEvents
