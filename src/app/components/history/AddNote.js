import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class AddNote extends Component {
  render() {
    return (
      <div>
        <span>{i18n('new note')}</span>
      </div>
    )
  }
}

AddNote.propTypes = {
  item: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(AddNote)
