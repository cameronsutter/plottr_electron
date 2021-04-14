import { SET_TOUR_FEATURE, TOUR_NEXT, TOUR_RESTART } from '../constants/ActionTypes'

export function setTourFeature(payload) {
  return {
    type: SET_TOUR_FEATURE,
    payload,
  }
}

export function tourNext(payload) {
  return {
    type: TOUR_NEXT,
    payload,
  }
}

export function tourRestart() {
  return {
    type: TOUR_RESTART,
  }
}
