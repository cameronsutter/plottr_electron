import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as PlaceActions from 'actions/places'
import PlaceView from 'components/places/placeView'

class PlaceListView extends Component {

  constructor (props) {
    super(props)
    this.state = {placeDetailId: props.places[0].id}
  }

  handleCreateNewPlace () {
    this.props.actions.addPlace()
  }

  renderPlaces () {
    const places = this.props.places.map((pl, idx) =>
      <a href='#' key={idx} className='list-group-item' onClick={() => this.setState({placeDetailId: pl.id})}>
        <h6 className='list-group-item-heading'>{pl.name}</h6>
        <p className='list-group-item-text'>{pl.description}</p>
      </a>
    )
    return (<div className='place-list__list list-group'>
        {places}
        <a href='#' key={'new-place'} className='place-list__new list-group-item' onClick={this.handleCreateNewPlace.bind(this)} >
          <Glyphicon glyph='plus' />
        </a>
      </div>
    )
  }

  renderPlaceDetails () {
    const place = this.props.places.find(pl =>
      pl.id === this.state.placeDetailId
    )
    return <PlaceView key={`place-${place.id}`} place={place} />
  }

  render () {
    return (
      <div className='place-list container-with-sub-nav'>
        <h1 className='secondary-text'>Places</h1>
        {this.renderPlaceDetails()}
        {this.renderPlaces()}
      </div>
    )
  }
}

PlaceListView.propTypes = {
  places: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    places: state.places
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(PlaceActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceListView)
