import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class EditNote extends Component {

  renderDiff (diff, index) {
    return (
      <div key={`diff-${index}-${diff.path[1]}`}>
        <span>{diff.path[2]}</span>
        <p>Before: <span className='history-component__item__before'>{diff.lhs}</span></p>
        <p>After: <span className='history-component__item__after'>{diff.rhs}</span></p>
      </div>
    )
  }

  render () {
    const item = this.props.item
    const diffs = item.diff.map(this.renderDiff, this)
    return (
      <div>
        <span>note: "{item.action.title}"</span>
        {diffs}
      </div>
    )
  }
}

EditNote.propTypes = {
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
)(EditNote)
