import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import ErrorBoundary from './ErrorBoundary'
import GuidedTour from '../components/GuidedTour'

export default class App extends Component {
  renderGuidedTour () {
    if (!this.props.showTour) return null

    return <GuidedTour />
  }

  render () {
    return <ErrorBoundary>
      <Navigation />
      <Body />
      { this.renderGuidedTour() }
    </ErrorBoundary>
  }
}
