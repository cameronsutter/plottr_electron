import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Glyphicon } from 'react-bootstrap'
import PlaceView from 'components/notes/placeView'
import 'style!css!sass!css/place_list_block.css.scss'

class PlaceListView extends Component {

  handleCreateNewPlace () {

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
  places: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    places: state.places
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceListView)
