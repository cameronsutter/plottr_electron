import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class DeleteLine extends Component {

  render () {
    const item = this.props.item
    var line = _.find(item.before.lines, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>storyline: "{line.title}"</span>
        <p>Before: <span className='history-component__item__before'>{line.title}</span></p>
        <p>After: </p>
      </div>
    )
  }
}

DeleteLine.propTypes = {
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
)(DeleteLine)
