import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class AddLine extends Component {

  render () {
    const item = this.props.item
    return (
      <div>
        <span>new storyline</span>
        <p>Before: </p>
        <p>After: <span className='history-component__item__after'>{item.action.title}</span></p>
      </div>
    )
  }
}

AddLine.propTypes = {
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
)(AddLine)
