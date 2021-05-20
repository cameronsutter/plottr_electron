import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'
import { ACTS_TOUR_STEPS } from './actsTourSteps'

import ReactJoyride, { EVENTS } from 'react-joyride'

const { tourSelector } = selectors

class Tour extends Component {
  constructor(props) {
    super(props)
    this.state = {
      steps:[]
    }
  }

  componentDidMount = () => {
    switch(this.props.tour.feature.id) {
      case(1):
        this.setState({steps: ACTS_TOUR_STEPS})
        break
    }
  }

  handleJoyrideCallback = (data) => {
    const { action, type } = data

    if (type === EVENTS.STEP_AFTER && !this.props.tour.transitioning)
      this.props.actions.tourNext(action)
    if (action === 'close' && this.props.tour.feature.endStep === this.props.tour.stepIndex + 1) 
      this.props.actions.tourNext(action)
  }

  render() {
    return (
      <ReactJoyride
        scrollToFirstStep
        {...this.props.tour}
        steps={this.state.steps}
        callback={this.handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 1001,
          },
          buttonNext: {
            backgroundColor: '#ff9466',
            borderWidth: 0,
          },
          buttonBack: {
            color: '#ff9466',
          },
          tooltipTitle: {
            color: 'black',
          },
        }}
      />
    )
  }
}

Tour.propTypes = {
  tour: PropTypes.object
}

function mapStateToProps(state) {
  return {tour:tourSelector(state.present)}
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.tour, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tour)
