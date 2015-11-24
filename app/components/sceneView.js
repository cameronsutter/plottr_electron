import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup, Input } from 'react-bootstrap'
import * as SceneActions from 'actions/scenes'
import 'style!css!sass!../css/scene_list_block.css.scss'

class SceneView extends Component {
  constructor (props) {
    super(props)
    this.state = {hovering: false, editing: false}
  }

  handleFinishEditing (event) {
    if (event.which === 13) {
      var id = this.props.scene.id
      var newTitle = this.refs.titleInput.getValue()
      this.props.actions.editSceneTitle(id, newTitle)
      this.setState({editing: false})
    }
  }

  renderHoverOptions () {
    if (!this.state.hovering) return
    return (<div className='scene-list__item__hover-options'>
      <ButtonGroup>
        <Button onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
        <Button bsStyle='danger'><Glyphicon glyph='trash' /></Button>
      </ButtonGroup>
    </div>)
  }

  renderTitle () {
    if (!this.state.editing) return <span>{this.props.scene.title}</span>
    return (<Input
        type='text'
        placeholder={this.props.scene.title}
        label='Scene name'
        ref='titleInput'
        autoFocus
        onBlur={() => this.setState({editing: false})}
        onKeyPress={this.handleFinishEditing.bind(this)} />)
  }

  render () {
    var style = {}
    if (this.state.hovering) style = {justifyContent: 'space-between'}
    return (<li className='scene-list__item'
      style={style}
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})} >
      {this.renderHoverOptions()}
      <div className='scene-list__item__title'>
        {this.renderTitle()}
      </div>
    </li>)
  }
}

SceneView.propTypes = {
  scene: PropTypes.object.isRequired,
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
)(SceneView)
