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

    var scenesArray = []
    const scenes = _.sortBy(this.props.scenes, 'position')
    scenes.splice(nextPosition, 0, newScene)

    this.props.actions.reorderScenes(scenes)
  }

  handleReorder = (originalScenePosition, droppedScenePosition) => {
    const scenes = _.sortBy(this.props.scenes, 'position')
    const [removed] = scenes.splice(droppedScenePosition, 1)
    scenes.splice(originalScenePosition, 0, removed)
    this.props.actions.reorderScenes(scenes)
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
