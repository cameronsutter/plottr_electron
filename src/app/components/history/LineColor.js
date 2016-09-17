import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class EditScene extends Component {

  render () {
    const item = this.props.item
    const diff = item.diff[0]
    const line = _.find(this.props.lines, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>storyline: "{line.title}"</span>
        <p>Before: <span className='history-component__item__before' style={{color: diff.lhs}}>{diff.lhs} </span><span className='history-component__item__color' style={{backgroundColor: diff.lhs}}></span></p>
        <p>After: <span style={{color: diff.rhs}}>{diff.rhs} </span><span className='history-component__item__color' style={{backgroundColor: diff.rhs}}></span></p>
      </div>
    )
  }
}

EditScene.propTypes = {
  item: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines
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
