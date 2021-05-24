import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors, tourConstants } from 'pltr/v2'
import { ACTS_TOUR_STEPS } from './actsTourSteps'

import ReactJoyride, { ACTIONS, EVENTS } from 'react-joyride'

const { tourSelector } = selectors

const { ACTS_TOUR } = tourConstants

class Tour extends Component {
  constructor(props) {
    super(props)
    this.state = {
      steps: [],
    }
  }

  componentDidMount = () => {
    switch (this.props.tour.feature) {
      case ACTS_TOUR:
        this.setState({ steps: ACTS_TOUR_STEPS })
        break
    }
  }

  handleJoyrideCallback = (data) => {
    const { action, type } = data
    const { tour } = this.props

    if (type === EVENTS.TARGET_NOT_FOUND) {
      // Element exists, but is invisible.  We're fine with that!
      if (document.querySelector(data.step.target)) return
      this.props.actions.setStep(8)
      return
    }

    if (action === ACTIONS.NEXT && type === EVENTS.STEP_AFTER) {
      if (tour.appInteractionAdvanced) {
        this.props.actions.resetAdvanceSource()
      } else {
        this.props.actions.tourNext(tour.feature, tour.stepIndex, false)
      }
    }
  }

  render() {
    const { showTour, stepIndex } = this.props.tour

    return (
      <ReactJoyride
        disableCloseOnEsc
        scrollToFirstStep
        hideCloseButton
        continuous
        showTour={showTour}
        stepIndex={stepIndex}
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
            display: 'none',
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
  tour: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return { tour: tourSelector(state.present) }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.tour, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tour)
