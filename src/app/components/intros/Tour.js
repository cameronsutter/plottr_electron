import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'

import ReactJoyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";

const { tourSelector } = selectors
import { ACTS_TOUR_STEPS } from './tourSteps'

class Tour extends Component {
  state = {
    continuous: true,
    loading: this.props.loading,
    run: this.props.run,
    steps:this.props.steps,
    stepIndex: this.props.stepIndex
  };

  static propTypes = {
    joyride: PropTypes.shape({
      callback: PropTypes.func
    })
  };

  static defaultProps = {
    joyride: {}
  };

  handleClickStart = e => {
    e.preventDefault();

    this.setState({
      run: true,
      stepIndex: 0
    });
  };

  handleClickNextButton = () => {
    const { stepIndex } = this.state;

    if (this.state.stepIndex === 1) {
      this.setState({
        stepIndex: stepIndex + 1
      });
    }
  };

  handleJoyrideCallback = data => {
    const { joyride } = this.props;
    const { action, index, type, status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) && this.state.run) {
      // Need to set our running state to false, so we can restart if we click start again.
      console.log(type,'FINISHED/SKIPPED+++++++++++')
      this.setState({ run: false });
      setTimeout(() => {
        this.setState({
          loading: false,
          run: true,
        //   stepIndex: index + (action === ACTIONS.PREV ? -1 : 1)
        });
        //   this.props.actions.tourNext(action)        
      }, 2000);
    } else if (type === EVENTS.STEP_AFTER && index === 0 && action !== ACTIONS.PREV) {// XXXXXX CHANGE INDEX === 0 HERE TO IF MOUNTING_TRANSITION === TRUE -- use a redux state of mountingTransition (like the 'loading' state) so this is scalable across features, certain features would have certain stepIndexes that would transition between a modal and would therefore run the setTimeout or whatever was necessary to make that transition (put a switch in redux for where each feature's modalTransitions are)
      console.log(type,'AFTER======111111111111111')    
  
      this.setState({ run: false, loading: true });

      setTimeout(() => {
        this.setState({
          loading: false,
          run: true,
        //   stepIndex: index + (action === ACTIONS.PREV ? -1 : 1)
        });
        //   this.props.actions.tourNext(action)        
      }, 2000);
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Update state to advance the tour
      console.log(type,'AFTER+++++++++++')    
      this.props.actions.tourNext(action)

    } else if (type === EVENTS.TOOLTIP_CLOSE) {
      console.log(type,'CLOSE+++++++++++')
    //   this.props.actions.tourNext(action)
    }

    if (typeof joyride.callback === "function") {
      joyride.callback(data);
    } else {
    //   console.group(type,'type');
    //   console.log(data,'data'); //eslint-disable-line no-console
      console.groupEnd();
    }
  };

  render() {
    //   console.log('======================== RE-RENDER')
    //   console.log('======================== RE-RENDER')
    //   console.log(this.props,'props for joyride')
    //   console.log('======================== RE-RENDER')
    //   console.log('======================== RE-RENDER')
    return (
      <div className="demo-wrapper">
        <ReactJoyride
          scrollToFirstStep
          debug
          {...this.props}
          callback={this.handleJoyrideCallback}
          styles={{
            options:{
              zIndex:1001
            },
            buttonNext:{
                backgroundColor:'#ff9466',
                borderWidth:0
            },
            buttonBack:{
                color:'#ff9466'
            }
          }}
        />
      </div>
    );
  }
}

Tour.propTypes = {
    tour: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    switch(state.present.tour.feature.name){
      case('acts'):
        state.present.tour.steps = ACTS_TOUR_STEPS
        break
      default:
        state.present.tour.steps = ['BEGINNER_TOUR_STEPS']
    }
    return tourSelector(state.present)
}
  
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions.tour, dispatch),
    }
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Tour)