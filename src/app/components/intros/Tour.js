import React, { Component } from 'react'
import { remote } from 'electron'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions, selectors } from 'pltr/v2'

import ReactJoyride, { EVENTS } from 'react-joyride'

const { tourSelector } = selectors
import { ACTS_TOUR_STEPS } from './actsTourSteps'

const win = remote.getCurrentWindow()

class Tour extends Component {
  state = {
    continuous: true,
    loading: this.props.loading,
    run: this.props.run,
    steps: this.props.steps,
    stepIndex: this.props.stepIndex,
    transitioning: this.props.transitioning,
    b2bTransition: this.props.b2bTransition,
    doneTransitioning: false,
  }

  static propTypes = {
    joyride: PropTypes.shape({
      callback: PropTypes.func,
    }),
  }

  static defaultProps = {
    joyride: {},
  }

  handleClickStart = (e) => {
    e.preventDefault()

    this.setState({
      run: true,
      stepIndex: 0,
    })
  }

  handleClickNextButton = () => {
    const { stepIndex } = this.state

    if (this.state.stepIndex === 1) {
      this.setState({
        stepIndex: stepIndex + 1,
      })
    }
  }

  handleJoyrideCallback = (data) => {
    const { joyride } = this.props
    const { action, index, type } = data

    if (
      type === EVENTS.STEP_AFTER &&
      this.props.transitioning === true &&
      this.state.doneTransitioning === false
    ) {
      // IF the next step's component isn't mounted yet
      // temporarily delay the next step so the component can mount
      this.setState({ run: false, loading: true })
      setTimeout(() => {
        this.setState({
          loading: false,
          run: true,
        })
      }, 400)
      // DON'T run the redux action TOUR_NEXT, TOUR_NEXT is triggered on click of
      // the component the previous step targets (e.g. <button className="acts-tour-step1">
      // in openBeatConfig in TimelineWrapper)
      if (!this.props.b2bTransition) this.setState({ doneTransitioning: true })
    } else if (type === EVENTS.STEP_AFTER) {
      this.setState({ run: false, loading: true, doneTransitioning: false })
      setTimeout(() => {
        this.setState({
          loading: false,
          run: true,
        })
      }, 400)
      // run the redux action TOUR_NEXT
      this.props.actions.tourNext(action)
      if (index === this.props.feature.endStep) win.reload()
    }

    if (typeof joyride.callback === 'function') {
      joyride.callback(data)
    } else {
      // console.group(type,'type');
      // console.log(data,'data'); //eslint-disable-line no-console
      // console.groupEnd();
    }
  }

  render() {
    return (
      <ReactJoyride
        scrollToFirstStep
        {...this.props}
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
  tour: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  run: PropTypes.bool.isRequired,
  steps: PropTypes.array.isRequired,
  stepIndex: PropTypes.number.isRequired,
  transitioning: PropTypes.bool,
  b2bTransition: PropTypes.bool,
  actions: PropTypes.object.isRequired,
  feature: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  // this determines which steps the tour should follow based on which feature is being toured
  switch (state.present.tour.feature.name) {
    case 'acts':
      state.present.tour.steps = ACTS_TOUR_STEPS
      break
    default:
      state.present.tour.run = false
  }
  return tourSelector(state.present)
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.tour, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tour)
