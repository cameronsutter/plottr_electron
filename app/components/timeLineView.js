import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import SceneListView from 'components/sceneListView'
import LineListView from 'components/lineListView'

class TimeLineView extends Component {
  render () {
    return (
      <div id='timelineview-root'>
          <SceneListView />
          <LineListView sceneMap={this.sceneMapping()} />
      </div>
    )
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
  scenes: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
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
