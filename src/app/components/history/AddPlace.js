import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class AddPlace extends Component {
  render() {
    const item = this.props.item
    var label = item.action.type.indexOf('PLACE') === -1 ? i18n('new character') : i18n('new place')
    if (item.action.type.indexOf('TAG') != -1) label = i18n('new tag')
    return (
      <div>
        <span>{label}</span>
      </div>
    )
  }
}

AddPlace.propTypes = {
  item: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(AddPlace)
