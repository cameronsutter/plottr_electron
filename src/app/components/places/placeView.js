import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, Input, Label, Glyphicon } from 'react-bootstrap'
import ColorPicker from '../colorpicker'
import * as PlaceActions from 'actions/places'

class PlaceView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false, showColorPicker: false, newColor: null}
  }

  saveEdit () {
    var newName = this.refs.nameInput.getValue() || this.props.place.name
    var newDescription = this.refs.descriptionInput.getValue() || this.props.place.description
    var newColor = this.state.newColor || this.props.place.color
    this.props.actions.editPlace(this.props.place.id, newName, newDescription, newColor)
    this.setState({editing: false})
  }

  changeColor (color) {
    this.setState({showColorPicker: false, newColor: color})
  }

  renderColorPicker () {
    if (this.state.showColorPicker) {
      var key = 'colorPicker-' + this.props.place.id
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
    const { place } = this.props
    return (
      <div className='place-list__place'>
        <Input type='text' ref='nameInput' label='place name' defaultValue={place.name} />
        <Input type='text' ref='descriptionInput' label='place description' defaultValue={place.description} />
        <Button bsStyle='primary' bsSize='large' onClick={() => this.setState({showColorPicker: true, newColor: null})} ><Glyphicon glyph='tint' /></Button>
        {this.renderColorPicker()}
        <div className='form-group place-list__color-label'><label className='control-label'>Current color: {this.renderColorLabel(place.color)}</label></div>
        <div className='form-group place-list__color-label'><label className='control-label'>New color: {this.renderColorLabel(this.state.newColor)}</label></div>
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

  renderPlace () {
    return (
      <div className='place-list__place' onClick={() => this.setState({editing: true})}>
        <h4>{this.props.place.name}</h4>
        <p>{this.renderColorLabel(this.props.place.color)} {this.props.place.description}</p>
      </div>
    )
  }

  render () {
    return this.state.editing ? this.renderEditing() : this.renderPlace()
  }
}

PlaceView.propTypes = {
  place: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(PlaceActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceView)
