// import $ from 'jquery'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import SceneListView from 'components/sceneListView'
import LineListView from 'components/lineListView'

class TimeLineView extends Component {
  render () {
    return this.props.fileIsLoaded ? this.renderBoard() : this.renderLoading()
  }

  renderBoard () {
    return (
      <div id='timelineview-root'>
          <SceneListView />
          <LineListView sceneMap={this.sceneMapping()} />
      </div>
    )
  }

  renderLoading () {
    return <p>Loading...</p>
  }

  sceneMapping () {
    var mapping = {}
    this.props.scenes.forEach((s) => {
      mapping[s.position] = s.id
    })
    return mapping
  }
}

TimeLineView.propTypes = {
  fileIsLoaded: PropTypes.bool.isRequired,
  storyName: PropTypes.string.isRequired,
  scenes: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    storyName: state.storyName,
    scenes: state.scenes
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeLineView)
