import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import ErrorBoundary from '../../containers/ErrorBoundary'
import TimelineWrapper from './TimelineWrapper'

export default class TimelineTab extends Component {
  render () {
    return <ErrorBoundary>
      <TimelineWrapper />
    </ErrorBoundary>
  }
}

