import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class DeleteNote extends Component {

  render () {
    const item = this.props.item
    var note = _.find(item.before.notes, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>{i18n('Note')}: "{note.title}"</span>
        <p>{i18n('Before')}: <span className='history-component__item__before'>{note.title}</span></p>
        <p>{i18n('After')}: </p>
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
