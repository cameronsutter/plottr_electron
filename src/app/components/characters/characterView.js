import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, Input, Label, Glyphicon } from 'react-bootstrap'
import ColorPicker from '../colorpicker'
import * as CharacterActions from 'actions/characters'

class CharacterView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false, showColorPicker: false, newColor: null}
  }

  saveEdit () {
    var newName = this.refs.nameInput.getValue() || this.props.character.name
    var newDescription = this.refs.descriptionInput.getValue() || this.props.character.description
    var newSketch = this.refs.sketchInput.getValue() || this.props.character.sketch
    var newColor = this.state.newColor || this.props.character.color
    this.props.actions.editCharacter(this.props.character.id, newName, newDescription, newSketch, newColor)
    this.setState({editing: false})
  }

  changeColor (color) {
    this.setState({showColorPicker: false, newColor: color})
  }

  renderColorPicker () {
    if (this.state.showColorPicker) {
      var key = 'colorPicker-' + this.props.character.id
      return <ColorPicker key={key} closeDialog={this.changeColor.bind(this)} />
    } else {
      return null
    }
  }

  renderColorLabel (color) {
    var colorLabel = null
    if (color) {
      var style = {backgroundColor: color}
      colorLabel = <Label bsStyle='info' style={style}>{color}</Label>
    }
    return <span>{colorLabel || ''}</span>
  }

  renderEditing () {
    const { character } = this.props
    return (
      <div className='character-list__character'>
        <Input type='text' ref='nameInput' label='Name' defaultValue={character.name} />
        <Input type='text' ref='descriptionInput' label='Short Description' defaultValue={character.description} />
        <Input type='textarea' rows="10" ref='sketchInput' label='Notes' defaultValue={character.sketch} />
        <Button bsStyle='primary' bsSize='large' onClick={() => this.setState({showColorPicker: true, newColor: null})} ><Glyphicon glyph='tint' /></Button>
        {this.renderColorPicker()}
        <div className='form-group character-list__color-label'><label className='control-label'>Current color: {this.renderColorLabel(character.color)}</label></div>
        <div className='form-group character-list__color-label'><label className='control-label'>New color: {this.renderColorLabel(this.state.newColor)}</label></div>
        <hr />
        <ButtonToolbar>
          <Button bsStyle='danger'
            onClick={() => this.setState({editing: false})} >
            Cancel
          </Button>
          <Button bsStyle='success'
            onClick={this.saveEdit.bind(this)} >
            Save
          </Button>
        </ButtonToolbar>
      </div>
    )
  }

  renderCharacter () {
    const { character } = this.props
    return (
      <div className='character-list__character' onClick={() => this.setState({editing: true})}>
        <h4>{character.name}</h4>
        <p>{this.renderColorLabel(character.color)} {character.description} </p>
      </div>
    )
  }

  render () {
    return this.state.editing ? this.renderEditing() : this.renderCharacter()
  }
}

CharacterView.propTypes = {
  character: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterView)
