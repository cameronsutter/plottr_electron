import React, { Component, PropTypes } from 'react'
import PureComponent from 'react.pure.component'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup, Input } from 'react-bootstrap'
import * as SceneActions from 'actions/scenes'
import orientedClassName from 'helpers/orientedClassName'
import i18n from 'format-message'

class SceneView extends Component {
  constructor (props) {
    super(props)
    let editing = props.scene.title === ''
    this.state = {hovering: false, editing: editing, dragging: false, dropping: false}
  }

  editTitle = () => {
    var id = this.props.scene.id
    var newTitle = this.refs.titleInput.getValue()
    this.props.actions.editSceneTitle(id, newTitle)
    this.setState({editing: false})
  }

  handleFinishEditing = (event) => {
    if (event.which === 13) {
      this.editTitle()
    }
  }

  handleBlur = () => {
    if (this.props.scene.title === '') {
      let newTitle = i18n('Scene {number}', {number: this.props.scene.position + 1})
      this.props.actions.editSceneTitle(this.props.scene.id, newTitle)
      this.setState({editing: false})
    } else {
      this.editTitle()
    }
  }

  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.scene))
    this.setState({dragging: true})
  }

  handleDragEnd = () => {
    this.setState({dragging: false})
  }

  handleDragEnter = (e) => {
    this.setState({dropping: true})
  }

  handleDragOver = (e) => {
    this.setState({dropping: true})
    e.preventDefault()
    return false
  }

  handleDragLeave = (e) => {
    this.setState({dropping: false})
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.setState({dropping: false})

    var json = e.dataTransfer.getData('text/json')
    var droppedScene = JSON.parse(json)
    if (droppedScene.id == null) return

    this.props.handleReorder(this.props.scene.position, droppedScene.position)
  }

  handleDelete = () => {
    let label = i18n("Do you want to delete this scene: { title }?", {title: this.props.scene.title})
    if (window.confirm(label)) {
      this.props.actions.deleteScene(this.props.scene.id)
    }
  }

  renderHoverOptions () {
    var style = {visibility: 'hidden'}
    if (this.state.hovering) style.visibility = 'visible'
    if (this.props.ui.orientation === 'vertical') {
      return (
        <div className={orientedClassName('scene-list__item__hover-options', this.props.ui.orientation)} style={style}>
          <Button block onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
          <Button block onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
        </div>
      )
    } else {
      return (<div className={orientedClassName('scene-list__item__hover-options', this.props.ui.orientation)} style={style}>
        <ButtonGroup>
          <Button onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
          <Button onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
        </ButtonGroup>
      </div>)
    }
  }

  renderTitle () {
    if (!this.state.editing) return <span>{this.props.scene.title}</span>
    return (<Input
        type='text'
        defaultValue={this.props.scene.title}
        label={i18n('Scene {number} name', {number: this.props.scene.position + 1})}
        ref='titleInput'
        autoFocus
        onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
        onBlur={this.handleBlur}
        onKeyPress={this.handleFinishEditing} />)
  }

  render () {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
    } else {
      window.SCROLLWITHKEYS = true
    }
    let classes = 'scene-list__item__body'
    if (this.state.hovering) classes += ' hover'
    if (this.state.dropping) classes += ' dropping'
    let titleClasses = 'scene-list__item__title'
    if (!this.state.hovering && this.props.ui.darkMode) titleClasses += ' darkmode'
    return (<div className={orientedClassName('scene-list__item', this.props.ui.orientation)}
      title={i18n('Scene {number}', {number: this.props.scene.position + 1})}
      draggable={true}
      onClick={() => this.setState({editing: true})}
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})}
      onDragStart={this.handleDragStart}
      onDragEnd={this.handleDragEnd}
      onDragEnter={this.handleDragEnter}
      onDragOver={this.handleDragOver}
      onDragLeave={this.handleDragLeave}
      onDrop={this.handleDrop} >
      {this.renderHoverOptions()}
      <div className={classes}>
        <div className={titleClasses}>
          {this.renderTitle()}
        </div>
      </div>
    </div>)
  }
}

SceneView.propTypes = {
  scene: PropTypes.object.isRequired,
  handleReorder: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  isZoomed: PropTypes.bool.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(SceneActions, dispatch)
  }
}

const Pure = PureComponent(SceneView)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pure)
