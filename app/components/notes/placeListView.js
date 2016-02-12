import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as PlaceActions from 'actions/places'
import PlaceView from 'components/notes/placeView'

class PlaceListView extends Component {

  handleCreateNewPlace () {
    this.props.actions.addPlace()
  }

  renderPlaces () {
    return this.props.places.map(p =>
      <PlaceView key={p.id} place={p} />
    )
  }

  render () {
    return (
      <div className='place-list'>
        <h3>Places</h3>
        {this.renderPlaces()}
        <div className='place-list__new' onClick={this.handleCreateNewPlace.bind(this)} >
          <Glyphicon glyph='plus' />
        </div>
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
