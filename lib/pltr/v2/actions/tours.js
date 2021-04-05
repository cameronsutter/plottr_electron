  import {
    SET_TOUR_FEATURE,
    TOUR_RUN,
    SET_TOUR_STEP,
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

  export function setTourStep (payload) {
    return { 
      type: SET_TOUR_STEP,
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

  export const callback = data => {
    const { index,  status } = data;
    let { type, action } = data
    // console.log(action,'action')
    // console.log(type,'type')
    // console.log(status,'status')
    // console.log(index,'index')
    // type = {tour:'start'}
    if (type === EVENTS.STEP_AFTER) {
        // if(index < 2){
            // setMounted(false)
            // setTimeout(() => {
            //     // console.log(type,'type')
            //     setMounted(true)
            setTimeout(() => {
              setTourStep(index + 1)
            },1000)
            // }
            // , 1000)
            
        // }
        // console.log(props.tour.step,'this.props.tour.step AFTER +++++++++++++++++++')
        // this.setState({step:this.state.step + 1})
    } else if (type === EVENTS.TARGET_NOT_FOUND){
        // type = EVENTS.TOUR_START
        // HMW prevent joyride from closing?
        // setMounted(false)
        // props.actions.setTourRun(true)
        // console.log(type,'type')
        // setMounted(false)
        
        // setTimeout(() => {
        //     // console.log(type,'type')
            
        //     setMounted(true)
        //     action = 'start'
        //     // console.log(action,'started')
        //     props.actions.setTourStep(index + 1)
        //     setTourStep(index + 1)}
        // , 1000)
        // console.log('this runs the local ACTIONS.close, but the redux of tourRun should stay true, and when the component mounts again the tour should then apply the current state of tourRun in the redux and the stepIndex passed through the redux action to restart the tour')
    } else {
        // console.log(type,'type SHOULD = CLOSE')
        // console.log(props.tour,'on close')
    }
    
  return {
    type:TOUR_CALLBACK,
    payload:{...data,run:true,step:4}
  }
};

  // export function nextOrPrev(index,action) {
  //   return {
  //       type: TOUR_NEXT_OR_PREVIOUS,
  //       payload: { stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) }
  //   };
  // }
  