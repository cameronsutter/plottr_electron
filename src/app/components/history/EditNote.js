import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class EditNote extends Component {

  renderDiff (diff, index) {
    return (
      <div key={`diff-${index}-${diff.path[1]}`}>
        <span>{diff.path[2]}</span>
        <p>{i18n('Before')}: <span className='history-component__item__before'>{diff.lhs}</span></p>
        <p>{i18n('After')}: <span className='history-component__item__after'>{diff.rhs}</span></p>
      </div>
    )
  }

  render () {
    const item = this.props.item
    const diffs = item.diff.map(this.renderDiff, this)
    return (
      <div>
        <span>{i18n('Note')}: "{item.action.title}"</span>
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
