import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import PlaceListView from 'components/places/placeListView'

class PlacesView extends Component {

  render () {
    return (
      <div className='places-view'>
        <PlaceListView />
      </div>
    )
  }
}

PlacesView.propTypes = {}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlacesView)
