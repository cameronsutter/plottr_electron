import { CLICK_ON_DOM, COLLECT_BEAT, DROP_BEAT } from '../constants/ActionTypes'

const INITIAL_STATE = {
  lastClick: {
    x: null,
    y: null,
    counter: 0,
  },
  droppedBeat: {
    coord: null,
    id: null,
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
    case DROP_BEAT: {
      return {
        ...state,
        droppedBeat: {
          coord: action.coord,
          id: action.id,
        },
      }
    }
    case COLLECT_BEAT: {
      return {
        ...state,
        droppedBeat: {
          coord: null,
          id: null,
        },
      }
    }
    default:
      return state
  }
}

export default domEvents
