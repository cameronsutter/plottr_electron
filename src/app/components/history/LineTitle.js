import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class EditScene extends Component {

  render () {
    const item = this.props.item
    const diff = item.diff[0]
    return (
      <div>
        <span>storyline: "{item.action.title}"</span>
        <p>Before: <span className='history-component__item__before'>{diff.lhs}</span></p>
        <p>After: <span className='history-component__item__after'>{diff.rhs}</span></p>
      </div>
    )
  }
}

EditScene.propTypes = {
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
)(EditScene)
