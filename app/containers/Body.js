import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import TimeLineView from 'components/timeline/timeLineView'

class Body extends Component {
  render () {
    return this.props.file.loaded ? this.renderBody() : this.renderLoading()
  }

  renderBody () {
    // eventually this will be a switch statement which will load
    // different bodies based on different currentView's
    return <TimeLineView />
  }

  renderLoading () {
    return <p>Loading...</p>
  }

}

Body.propTypes = {
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
)(Body)
