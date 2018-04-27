import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import i18n from 'format-message'

class AddScene extends Component {

  render () {
    const item = this.props.item
    return (
      <div>
        <span>{i18n('new scene')}</span>
      </div>
    )
  }
}

AddScene.propTypes = {
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
)(AddScene)
