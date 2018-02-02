import React, { Component, PropTypes } from 'react'
import PureComponent from 'react.pure.component'
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

  handleCreateNewScene = () => {
    this.props.actions.addScene()
  }

  handleInsertNewScene = (nextPosition) => {
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

  handleReorder = (originalScenePosition, droppedScenePosition) => {
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
      <div className={orientedClassName('scene-list', this.props.ui.orientation)}>
        <div className={orientedClassName('scene-list__placeholder', this.props.ui.orientation)} />
        {scenes}
        <div className={orientedClassName('scene-list__new', this.props.ui.orientation)} onClick={this.handleCreateNewScene} >
          <Glyphicon glyph='plus' />
        </div>
      </div>
    )
  }

  renderScenes () {
    const scenes = _.sortBy(this.props.scenes, 'position')
    let insertClasses = orientedClassName('scene-list__insert', this.props.ui.orientation)
    if (this.props.ui.darkMode) insertClasses += ' darkmode'
    return scenes.map((scene) => {
      return (
        <div className={orientedClassName('scene-list__item-container', this.props.ui.orientation)} key={'sceneId-' + scene.id}>
          <div className={insertClasses} onClick={() => this.handleInsertNewScene(scene.position, this)}>
            <Glyphicon glyph='plus' />
          </div>
          <SceneView
            scene={scene}
            handleReorder={this.handleReorder}
            isZoomed={this.props.isZoomed}
            zoomFactor={this.props.zoomFactor} />
        </div>
      )
    })
  }
}

SceneListView.propTypes = {
  scenes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  isZoomed: PropTypes.bool.isRequired,
  zoomFactor: PropTypes.any.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(SceneActions, dispatch)
  }
}

const Pure = PureComponent(SceneListView)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pure)
