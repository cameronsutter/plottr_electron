import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class OutlineView extends Component {
  render () {
    return <div>Coming Soon!</div>
  }
}

OutlineView.propTypes = {
  file: PropTypes.object.isRequired,
  currentView: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  return {
    file: state.file,
    currentView: state.ui.currentView
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OutlineView)
