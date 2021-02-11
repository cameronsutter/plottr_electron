import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class AddBeat extends Component {
  render() {
    return (
      <div>
        <span>{i18n('new beat')}</span>
      </div>
    )
  }
}

AddBeat.propTypes = {
  item: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(AddBeat)
