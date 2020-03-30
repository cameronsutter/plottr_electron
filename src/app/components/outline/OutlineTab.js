import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import ErrorBoundary from '../../containers/ErrorBoundary'
import OutlineView from './OutlineView'

export default class OutlineTab extends Component {
  render () {
    return <ErrorBoundary>
      <OutlineView />
    </ErrorBoundary>
  }
}

