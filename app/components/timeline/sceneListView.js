import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SceneView from 'components/timeline/sceneView'
import { Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import * as SceneActions from 'actions/scenes'
import { scene } from 'store/initialState'
import { sceneId, chapterId } from 'store/newIds'
import 'style!css!sass!css/scene_list_block.css.scss'

class SceneListView extends Component {

  handleCreateNewScene () {
    this.props.actions.addScene(chapterId())
  }

  handleInsertNewScene (nextPosition) {
    var newId = sceneId(this.props.scenes)
    var newScene = _.clone(scene)
    newScene['id'] = newId
    newScene['chapterId'] = chapterId()
    newScene['position'] = nextPosition

    var scenesArray = []
    var scenes = [newScene].concat(this.props.scenes)
    scenes.forEach((s) => {
      var clonedScene = _.clone(s)
      if (clonedScene.id !== newScene.id && clonedScene.position >= nextPosition) {
        clonedScene.position += 1
      }
      scenesArray.push(clonedScene)
    })

    this.saveReorder(scenesArray)
  }

  handleReorder (originalScenePosition, droppedScenePosition) {
    var scenesArray = []
    this.props.scenes.forEach((s) => {
      var clonedScene = _.clone(s)
      if (s.position >= originalScenePosition && s.position !== droppedScenePosition) {
        clonedScene.position += 1
      } else if (s.position === droppedScenePosition) {
        clonedScene.position = originalScenePosition
      }
      scenesArray.push(clonedScene)
    })
    this.saveReorder(scenesArray)
  }

  saveReorder (scenes) {
    var scenesArray = this.resetPositions(scenes)
    this.props.actions.reorderScenes(scenesArray)
  }

  resetPositions (scenes) {
    var newScenes = _.sortBy(scenes, 'position')
    newScenes.forEach((s, idx) =>
      s['position'] = idx
    )
    return newScenes
  }

  render () {
    var scenes = this.renderScenes()
    return (
      <div className='scene-list'>
        <div className='scene-list__placeholder' />
        {scenes}
        <div className='scene-list__new' onClick={this.handleCreateNewScene.bind(this)} >
          <Glyphicon glyph='plus' />
        </div>
      </div>
    )
  }

  renderScenes () {
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map((scene) => {
      return (
        <div className='scene-list__item-container' key={'sceneId-' + scene.id}>
          <div className='scene-list__insert' onClick={() => this.handleInsertNewScene(scene.position, this)}>
            <Glyphicon glyph='plus' />
          </div>
          <SceneView scene={scene} handleReorder={this.handleReorder.bind(this)} />
        </div>
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
