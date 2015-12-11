import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SceneView from 'components/sceneView'
import { Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import * as SceneActions from 'actions/scenes'
import 'style!css!sass!../css/scene_list_block.css.scss'

class SceneListView extends Component {

  handleCreateNewScene () {
    var chapterId = 0 // eventually i'll implement this
    this.props.actions.addScene(chapterId)
  }

  handleReorder (originalScenePosition, droppedScenePosition) {
    var scenesArray = []
    this.props.scenes.forEach((s) => {
      var newScene = _.clone(s)
      if (s.position >= originalScenePosition && s.position !== droppedScenePosition) {
        newScene.position += 1
      } else if (s.position === droppedScenePosition) {
        newScene.position = originalScenePosition
      }
      scenesArray.push(newScene)
    })
    // potentially we'd want to reset all the positions so there aren't any gaps
    this.props.actions.reorderScenes(scenesArray)
  }

  render () {
    var scenes = this.renderScenes()
    return (
      <ul className='scene-list'>
        <li className='scene-list__placeholder' />
        {scenes}
        <li className='scene-list__new' onClick={this.handleCreateNewScene.bind(this)} >
          <Glyphicon glyph='plus' />
        </li>
      </ul>
    )
  }

  renderScenes () {
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map((scene) => {
      return (
        <SceneView key={'sceneId-' + scene.id} scene={scene} handleReorder={this.handleReorder.bind(this)} />
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
