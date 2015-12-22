import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class PlaceView extends Component {

  render () {
    return (
      <div className='place'>
        <h4>{this.props.place.name}</h4>
        <p>{this.props.place.description}</p>
      </div>
    )
  }
}

PlaceView.propTypes = {
  place: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceView)
