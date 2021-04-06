import {
    SET_TOUR_FEATURE,
    TOUR_RUN,
    TOUR_NEXT,
    SET_TOUR_STEP,
    SET_TOUR_CONTINUE_ON_MOUNT,
    TOUR_RESTART
} from '../constants/ActionTypes'
import { tour } from '../store/initialState'

const INITIAL_STATE = tour
  
export default function tours(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_TOUR_FEATURE:
      return state.feature = action.payload//an object with feature: 'string', featureId: int
    case TOUR_RUN:
      state.run = action.payload
      return state
    case TOUR_NEXT:      
      //switch to determine when the tour callback should delay until next step is mounted
      let transitionSteps = []
      state.b2bTransition = false
      switch(state.feature.name){
        case('acts'):

          transitionSteps = [0,4,5]

          if(transitionSteps.includes(state.stepIndex)){
            state.transitioning = true

            if(transitionSteps.includes(state.stepIndex + 1)){
              state.b2bTransition = true
            }

          } else {
            state.transitioning = false
          }
          break
        default:
          state.transitioning = false
      }
      
      if (action.payload === 'prev') {
        state.stepIndex = state.stepIndex - 1
      } else {
        state.stepIndex = state.stepIndex + 1
      }
      // console.log(action.payload,'action.payload in TOUR_NEXT')
      // console.log(state.stepIndex,'state.stepIndex in TOUR_NEXT')
      console.log(state.transitioning,'state.transitioning in TOUR_NEXT')
      
      let newState = new Object()
      newState['feature'] = state.feature
      newState['loading'] = false
      newState['run'] = true
      newState['stepIndex'] = state.stepIndex
      newState['transitioning'] = state.transitioning
      return {...state,newState}
    case SET_TOUR_STEP:
      state.step = action.payload
      // console.log(state,'state=================SET_TOUR_STEP')
      return state
    case SET_TOUR_CONTINUE_ON_MOUNT://if a component is unmounted when the previous tour step changes, onComponentDidMount run this action to restart the tour at the appropriate step
      state.action = action.payload.action
      state.run = action.payload.run
      state.step = action.payload.step
      return state //CONSIDER STORING 'MOUNTED' as a key value in state and maybe it won't exit 
    case TOUR_RESTART:
      return state = INITIAL_STATE
    default:
      return state;
  }
}