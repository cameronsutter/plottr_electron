import {
  SET_TOUR_FEATURE,
  TOUR_NEXT,
  TOUR_RESTART,
  TOUR_PREVIOUS,
  RESET_ADVANCE_SOURCE,
  SET_STEP,
} from '../constants/ActionTypes'
import { tour } from '../store/initialState'
import { ACTS_TOUR } from '../constants/tour'

const INITIAL_STATE = tour

const tours = (dataRepairers) => (state = INITIAL_STATE, action) => {
  const { feature, source, appInteractionAdvanced, overridenStepIndex, resetIfMismatch } = action

  switch (action.type) {
    case SET_TOUR_FEATURE: {
      return {
        ...state,
        feature,
        showTour: true,
      }
    }

    case SET_STEP: {
      return { ...state, stepIndex: overridenStepIndex }
    }

    case TOUR_PREVIOUS: {
      if (!state.showTour) return state

      if (source !== state.stepIndex) {
        if (resetIfMismatch) {
          return {
            ...state,
            stepIndex: 0,
            showTour: false,
          }
        }
        return state
      }

      const nextState = {
        ...state,
        stepIndex: state.stepIndex - 1,
        appInteractionAdvanced,
      }

      switch (feature) {
        case ACTS_TOUR:
          switch (state.stepIndex) {
            case 9:
              return {
                ...nextState,
                feature: null,
                toursTaken: [...state.toursTaken, feature],
              }
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            default:
              return nextState
          }
        default:
          return state
      }
    }

    case TOUR_NEXT: {
      if (!state.showTour) return state

      if (source !== state.stepIndex) {
        if (resetIfMismatch) {
          return {
            ...state,
            stepIndex: 0,
            showTour: false,
          }
        }
        return state
      }

      const nextState = {
        ...state,
        stepIndex: state.stepIndex + 1,
        appInteractionAdvanced,
      }

      switch (feature) {
        case ACTS_TOUR:
          switch (state.stepIndex) {
            case 9:
              return {
                ...nextState,
                feature: null,
                toursTaken: [...state.toursTaken, feature],
              }
            case 8:
              return {
                ...nextState,
                stepIndex: 0,
              }
            case 7:
              return {
                ...nextState,
                stepIndex: 9,
              }
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            default:
              return nextState
          }
        default:
          return state
      }
    }

    case RESET_ADVANCE_SOURCE: {
      return {
        ...state,
        appInteractionAdvanced: false,
      }
    }

    case TOUR_RESTART: {
      return INITIAL_STATE
    }

    default:
      return state
  }
}

export default tours
