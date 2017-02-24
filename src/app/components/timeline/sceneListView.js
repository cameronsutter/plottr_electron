import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SceneView from 'components/timeline/sceneView'
import { Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import * as SceneActions from 'actions/scenes'
import { scene } from 'store/initialState'
import { sceneId } from 'store/newIds'
import orientedClassName from 'helpers/orientedClassName'

class SceneListView extends Component {

  handleCreateNewScene () {
    this.props.actions.addScene()
  }

  handleInsertNewScene (nextPosition) {
    var newId = sceneId(this.props.scenes)
    var newScene = _.clone(scene)
    newScene['id'] = newId
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
      <div className={orientedClassName('scene-list', this.props.orientation)}>
        <div className={orientedClassName('scene-list__placeholder', this.props.orientation)} />
        {scenes}
        <div className={orientedClassName('scene-list__new', this.props.orientation)} onClick={this.handleCreateNewScene.bind(this)} >
          <Glyphicon glyph='plus' />
        </div>
      </div>
    )
  }

  renderScenes () {
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map((scene) => {
      return (
        <div className={orientedClassName('scene-list__item-container', this.props.orientation)} key={'sceneId-' + scene.id}>
          <div className={orientedClassName('scene-list__insert', this.props.orientation)} onClick={() => this.handleInsertNewScene(scene.position, this)}>
            <Glyphicon glyph='plus' />
          </div>
          <SceneView
            scene={scene}
            orientation={this.props.orientation}
            handleReorder={this.handleReorder.bind(this)}
            isZoomed={this.props.isZoomed} />
        </div>
      )
    })
  }
}

SceneListView.propTypes = {
  scenes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  filteredItems: PropTypes.object.isRequired,
  isZoomed: PropTypes.bool.isRequired,
  orientation: PropTypes.string.isRequired
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
