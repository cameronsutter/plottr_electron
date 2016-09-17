import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class AddScene extends Component {

  render () {
    const item = this.props.item
    return (
      <div>
        <span>new scene</span>
        <p>Before: </p>
        <p>After: <span className='history-component__item__after'>{item.action.title}</span></p>
      </div>
    )
  }
}

AddScene.propTypes = {
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
)(AddScene)
