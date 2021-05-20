import { SET_TOUR_FEATURE, TOUR_NEXT, TOUR_TRANSITION, TOUR_RESTART } from '../constants/ActionTypes'
import { tour } from '../store/initialState'

const INITIAL_STATE = tour

export default function tours(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_TOUR_FEATURE:
      const newState = Object.assign({}, INITIAL_STATE)
      newState.feature = action.payload //an object with feature: 'string', featureId: int
      newState.showTour = true
      return newState
    //main tour callback
    case TOUR_NEXT: {
      let transitionSteps = []
      let endStep
      const newState = Object.assign({}, state)

      //ensure the tour runs at the next step
      newState.loading = false
      newState.run = true

      //determines whether the tour callback moves on when 'next' is clicked or when a specific app component is clicked
      switch (newState.feature.name) {
        case 'acts':
          transitionSteps = [0,4,5,6,7]
          endStep = 8
          break
        default:
          newState.transitioning = false
      }

      //increment or decrement stepIndex
      if (action.payload === 'prev') {
        newState.stepIndex = newState.stepIndex - 1
      } else {
        newState.stepIndex = newState.stepIndex + 1
      }

      newState.transitioning = false

      //delay the next step until component associated with the step is mounted
      if (transitionSteps.includes(newState.stepIndex)) {
        newState.transitioning = true
      } 

      //stop the tour at the appropriate endStep,
      //store that they have completed this tour,
      //clear the feature so the tour doesn't run again unless manually started
      if (newState.stepIndex === endStep) {
        newState.toursTaken.length ? newState.toursTaken = [...newState.toursTaken,newState.feature.name] : [newState.feature.name]
        newState.feature = {}
        newState.run = false
      }
      
      return newState
    }
    case TOUR_TRANSITION: 
      const nextState = Object.assign({}, state)
      nextState.run = false
      nextState.loading = true
      return nextState
    case TOUR_RESTART: {
      return INITIAL_STATE
    }
    default:
      return state
  }
}
