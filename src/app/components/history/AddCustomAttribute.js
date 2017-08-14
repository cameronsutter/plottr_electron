import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class AddCustomAttribute extends Component {

  render () {
    const item = this.props.item
    let label = item.action.type.indexOf('PLACES') === -1 ? 'character' : 'place'
    return (
      <div>
        <span>new custom {label} attribute</span>
        <p>Before: </p>
        <p>After: <span className='history-component__item__after'>{item.action.attribute}</span></p>
      </div>
    )
  }
}

AddCustomAttribute.propTypes = {
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
)(AddCustomAttribute)
