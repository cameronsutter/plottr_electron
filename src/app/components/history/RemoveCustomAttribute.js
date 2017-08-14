import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class RemoveCustomAttribute extends Component {

  render () {
    const item = this.props.item
    let label = item.action.type.indexOf('PLACES') === -1 ? 'character' : 'place'
    return (
      <div>
        <span>custom {label} attribute</span>
        <p>Before: <span className='history-component__item__before'>{item.action.attribute}</span></p>
        <p>After: </p>
      </div>
    )
  }
}

RemoveCustomAttribute.propTypes = {
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
)(RemoveCustomAttribute)
