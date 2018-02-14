import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class DeleteNote extends Component {

  render () {
    const item = this.props.item
    var note = _.find(item.before.notes, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>note: "{note.title}"</span>
        <p>Before: <span className='history-component__item__before'>{note.title}</span></p>
        <p>After: </p>
      </div>
    )
  }
}

DeleteNote.propTypes = {
  item: PropTypes.object.isRequired,
  notes: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    notes: state.notes
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteNote)
