import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class AddLine extends Component {

  render () {
    const item = this.props.item
    return (
      <div>
        <span>{i18n('new storyline')}</span>
      </div>
    )
  }
}

AddLine.propTypes = {
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
)(AddLine)
