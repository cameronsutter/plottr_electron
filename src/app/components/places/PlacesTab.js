import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import PlaceListView from 'components/places/PlaceListView'
import ErrorBoundary from '../../containers/ErrorBoundary'

export default class PlacesTab extends Component {
  render() {
    return (
      <ErrorBoundary>
        <PlaceListView />
      </ErrorBoundary>
    )
  }
}
