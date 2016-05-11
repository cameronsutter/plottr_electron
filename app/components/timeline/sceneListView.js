import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SceneView from 'components/timeline/sceneView'
import { Button, Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import * as SceneActions from 'actions/scenes'
import { scene } from 'store/initialState'
import { sceneId, chapterId } from 'store/newIds'

class SceneListView extends Component {

  constructor (props) {
    super(props)
    this.state = {filterOpen: false}
  }

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

  toggleFilter () {
    this.setState({filterOpen: !this.state.filterOpen})
  }

  isChecked (type, id) {
    return this.props.filteredItems[type].indexOf(id) !== -1
  }

  render () {
    var scenes = this.renderScenes()
    var style = {}
    if (this.state.filterOpen) style = {display: 'block'}
    return (
      <div className='scene-list'>
        <div className='scene-list__placeholder' >
          <Button bsSize='small' onClick={this.toggleFilter.bind(this)}><Glyphicon glyph='filter' /> Filter</Button>
          <div style={style} className='scene-list__filter'>
            <p onClick={() => this.props.filterList('tag', this.props.tags)}><em>Tags</em></p>
              {this.renderFilterList(this.props.tags, 'tag', 'title')}
            <p onClick={() => this.props.filterList('character', this.props.characters)}><em>Characters</em></p>
              {this.renderFilterList(this.props.characters, 'character', 'name')}
            <p onClick={() => this.props.filterList('place', this.props.places)}><em>Places</em></p>
              {this.renderFilterList(this.props.places, 'place', 'name')}
          </div>
        </div>
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

  renderFilterList (array, type, attr) {
    var items = array.map((i) => {
      return this.renderFilterItem(i, type, attr)
    })
    return (
      <ul className='scene-list__filter-list'>
        {items}
      </ul>
    )
  }

  renderFilterItem (item, type, attr) {
    var checked = 'unchecked'
    if (this.isChecked(type, item.id)) {
      checked = 'eye-open'
    }
    return (<li key={`${type}-${item.id}`} onMouseDown={() => this.props.filterItem(type, item.id)}>
        <Glyphicon glyph={checked} /> {item[attr]}
      </li>
    )
  }
}

SceneListView.propTypes = {
  scenes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  filterItem: PropTypes.func.isRequired,
  filterList: PropTypes.func.isRequired,
  filteredItems: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    tags: state.tags,
    characters: state.characters,
    places: state.places
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
