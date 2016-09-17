import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class EditPlace extends Component {

  renderDiff (diff, index) {
    if (diff.path[2] === 'color') {
      return (
        <div key={`diff-${index}-${diff.path[1]}`}>
          <span>{diff.path[2]}</span>
          <p>Before: <span className='history-component__item__before' style={{color: diff.lhs}}>{diff.lhs} </span><span className='history-component__item__color' style={{backgroundColor: diff.lhs}}></span></p>
          <p>After: <span style={{color: diff.rhs}}>{diff.rhs} </span><span className='history-component__item__color' style={{backgroundColor: diff.rhs}}></span></p>
        </div>
      )
    } else {
      return (
        <div key={`diff-${index}-${diff.path[1]}`}>
          <span>{diff.path[2]}</span>
          <p>Before: <span className='history-component__item__before'>{diff.lhs}</span></p>
          <p>After: <span className='history-component__item__after'>{diff.rhs}</span></p>
        </div>
      )
    }
  }

  render () {
    const item = this.props.item
    const diffs = item.diff.map(this.renderDiff, this)
    var label = item.action.type.indexOf('PLACE') === -1 ? 'character' : 'place'
    label = item.action.type.indexOf('TAG') === -1 ? 'character' : 'tag'
    return (
      <div>
        <span>{label}: "{item.action.name || item.action.title}"</span>
        {diffs}
      </div>
    )
  }
}

EditPlace.propTypes = {
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
)(EditPlace)
