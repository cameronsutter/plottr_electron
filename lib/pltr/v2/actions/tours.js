  import {
    SET_TOUR_FEATURE,
    TOUR_RUN,
    TOUR_END,
    TOUR_NEXT,
    SET_TOUR_CONTINUE_ON_MOUNT,
    TOUR_RESTART
  } from '../constants/ActionTypes'

  import JoyRide, { ACTIONS, EVENTS, STATUS } from "react-joyride"

  export function setTourFeature (payload) {
    return { 
      type: SET_TOUR_FEATURE,
      payload
    }
  }

  export function setTourRun (payload) {
    return { 
      type: TOUR_RUN,
      payload
    }
  }

  export function tourNext (payload) {
    return { 
      type: TOUR_NEXT,
      payload
    }
  }

  export function tourEnd (payload) {
    return { 
      type: TOUR_END,
      payload
    }
  }

  export function setTourContinueOnMount (payload) {
    return { 
      type: SET_TOUR_CONTINUE_ON_MOUNT,
      payload
    }
  }

  export function tourRestart () {
    return { 
      type: TOUR_RESTART
    }
  }