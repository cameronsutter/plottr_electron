import {
    SET_TOUR_FEATURE,
    TOUR_RUN,
    TOUR_NEXT,
    TOUR_END,
    SET_TOUR_CONTINUE_ON_MOUNT,
    TOUR_RESTART
} from '../constants/ActionTypes'
import { tour } from '../store/initialState'

const INITIAL_STATE = tour
  
export default function tours(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_TOUR_FEATURE:
      state.feature = action.payload
      return {...state, state} //an object with feature: 'string', featureId: int
    case TOUR_RUN:
      state.run = action.payload
      return {...state,state}
    case TOUR_NEXT:      
      let transitionSteps = []
      let endStep
      state.b2bTransition = false
    //switch to determine when the tour callback should delay until next step's component is mounted
      switch(state.feature.name){
        case('acts'):
          transitionSteps = [0,4,5,6]
          endStep = 9
          break
        default:
          state.transitioning = false
      }
    //when to delay the next step until component is mounted
      if(transitionSteps.includes(state.stepIndex)){
        state.transitioning = true

        if(transitionSteps.includes(state.stepIndex + 1)){
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
      if(state.stepIndex === endStep) {
        state.toursTaken[`${state.feature.name}`] = true
        state.feature = {}
        state.run = false
      }
      console.log(state.stepIndex,'state.stepIndex')
      return {...state,state}
    case TOUR_END:
      console.log(state.toursTaken,'toursTaken should be TOTALL BLANK')
      state.toursTaken[`${state.feature.name}`] = true
      state.feature = {}
      state.run = false
      console.log(state.toursTaken,'toursTaken should include acts:true')
      return {...state,state}
    case SET_TOUR_CONTINUE_ON_MOUNT://if a component is unmounted when the previous tour step changes, onComponentDidMount run this action to restart the tour at the appropriate step
      state.action = action.payload.action
      state.run = action.payload.run
      state.step = action.payload.step
      return state //CONSIDER STORING 'MOUNTED' as a key value in state and maybe it won't exit 
    case TOUR_RESTART:
      newState = INITIAL_STATE
      return {...state,newState}
    default:
      return state;
  }
}