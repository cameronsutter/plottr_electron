import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SceneView from 'components/sceneView'
import * as SceneActions from '../actions/scenes'
import _ from 'lodash'
import 'style!css!sass!../css/scene_list_block.css.scss'

class SceneListView extends Component {

  handleCreateNewScene () {
    this.props.actions.addScene(0, null)
  }

  render () {
    var scenes = this.renderScenes()
    return (
      <ul className='scene-list'>
        <li className='scene-list__placeholder' />
        {scenes}
        <li className='scene-list__new' onClick={this.handleCreateNewScene.bind(this)} />
      </ul>
    )
  }

  renderScenes () {
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map((scene) => {
      return (
        <SceneView key={'sceneId-' + scene.id} scene={scene} />
      )
    })
  }
}

SceneListView.propTypes = {
  scenes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(SceneActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SceneListView)
