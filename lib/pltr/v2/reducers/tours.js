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
      //this gets called when the element gets clicked, not when the next button is clicked
      //XX MAKE MODALTRANSITION PART OF INITIAL STATE, MAP IT TO TOUR COMPONENT -- this makes 'transitioning' something we can place all over the app without having to select specific steps with tons of switches/conditionals
      if (action.payload === 'prev') {
        state.stepIndex = state.stepIndex - 1
      } else {
        state.stepIndex = state.stepIndex + 1
      }
      // console.log(action.payload,'action.payload in TOUR_NEXT')
      console.log(state.stepIndex,'state.stepIndex in TOUR_NEXT')
      // if(state.stepIndex === 1){
      //   setTimeout(() => state.loading = false, 1000)
      // }
      let newState = new Object()
      newState['feature'] = state.feature
      newState['loading'] = false
      newState['run'] = true
      newState['stepIndex'] = state.stepIndex
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