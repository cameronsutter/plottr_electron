import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class DeletePlace extends Component {

  render () {
    const item = this.props.item
    var place = _.find(item.before.places, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>card: "{place.title}"</span>
        <p>Before: <span className='history-component__item__before'>{place.title}</span></p>
        <p>After: </p>
      </div>
    )
  }
}

DeletePlace.propTypes = {
  item: PropTypes.object.isRequired,
  places: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    places: state.places
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeletePlace)
