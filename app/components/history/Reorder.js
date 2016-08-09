import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class Reorder extends Component {

  render () {
    const item = this.props.item
    if (item.action.type.indexOf('SCENES') !== -1) {
      var things = 'scenes'
    } else {
      things = 'storylines'
    }
    return (
      <div>
        <p>a lot of {things} moved around</p>
      </div>
    )
  }
}

Reorder.propTypes = {
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
)(Reorder)
