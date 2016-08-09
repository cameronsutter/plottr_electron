import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class AddPlace extends Component {

  render () {
    const item = this.props.item
    var label = item.action.type.indexOf('PLACE') === -1 ? 'character' : 'place'
    label = item.action.type.indexOf('TAG') === -1 ? 'character' : 'tag'
    return (
      <div>
        <span>new {label}</span>
        <p>Before: </p>
        <p>After: <span className='history-component__item__after'>{item.action.name || item.action.title}</span></p>
      </div>
    )
  }
}

AddPlace.propTypes = {
  item: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPlace)
