import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import SceneView from 'components/sceneView'
import 'style!css!sass!../css/scene_list_block.css.scss'

class SceneListView extends Component {
  render () {
    var scenes = this.renderScenes()
    return (
      <ul className='scene-list'>
        <li className='scene-list__placeholder' />
        {scenes}
        <li className='scene-list__new' />
      </ul>
    )
  }

  renderScenes () {
    return this.props.scenes.map((scene) => {
      return (
        <SceneView key={'sceneId-' + scene.id} scene={scene} />
      )
    })
  }
}

SceneListView.propTypes = {
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
)(SceneListView)
