import { LOAD_TOUR, SET_TOUR_FEATURE, TOUR_NEXT, TOUR_RESTART } from '../constants/ActionTypes'
import { tour } from '../store/initialState'

const INITIAL_STATE = tour

const tours =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SET_TOUR_FEATURE: {
        const newState = Object.assign({}, INITIAL_STATE)
        newState.feature = action.payload //an object with feature: 'string', featureId: int
        newState.showTour = true
        return { ...state, ...newState }
      }

      //main tour callback
      case TOUR_NEXT: {
        let transitionSteps = []
        let endStep
        state.b2bTransition = false
        //switch based on which tour is running -> to determine when the
        //tour callback should delay until next step's component is mounted
        switch (state.feature.name) {
          case 'acts':
            transitionSteps = [0, 4, 5, 6]
            endStep = 9
            break
          default:
            state.transitioning = false
        }
        //delay the next step until component associated with the step is mounted
        if (transitionSteps.includes(state.stepIndex)) {
          state.transitioning = true
          //need to anticipate back-to-back delays
          if (transitionSteps.includes(state.stepIndex + 1)) {
            state.b2bTransition = true
          }
        } else {
          state.transitioning = false
        }
        //increment or decrement stepIndex
        if (action.payload === 'prev') {
          state.stepIndex = state.stepIndex - 1
        } else {
          state.stepIndex = state.stepIndex + 1
        }
        //ensure the tour runs at the next step
        state.loading = false
        state.run = true
        //stop the tour at the appropriate endStep,
        //store that they have completed this tour,
        //clear the feature so the tour doesn't run again unless manually started
        if (state.stepIndex === endStep) {
          state.toursTaken[`${state.feature.name}`] = true
          state.feature = {}
          state.run = false
        }
        state.showTour = false
        return { ...state, state }
      }

      case TOUR_RESTART: {
        const newState = INITIAL_STATE
        return { ...state, newState }
      }

      case LOAD_TOUR:
        return action.tour

      default:
        return state
    }
  }

export default tours
