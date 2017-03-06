import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, Input, Label, Glyphicon } from 'react-bootstrap'
import ColorPicker from '../colorpicker'
import * as PlaceActions from 'actions/places'

class PlaceView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: props.place.name === ''}
  }

  handleEnter (event) {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  saveEdit () {
    var newName = this.refs.nameInput.getValue() || this.props.place.name
    var newDescription = this.refs.descriptionInput.getValue() || this.props.place.description
    var newNotes = this.refs.notesInput.getValue() || this.props.place.notes
    var newColor = this.state.newColor || this.props.place.color
    this.props.actions.editPlace(this.props.place.id, newName, newDescription, newNotes, newColor)
    this.setState({editing: false})
  }

  renderEditing () {
    const { place } = this.props
    return (
      <div className='place-list__place'>
        <Input type='text' ref='nameInput' autoFocus
          onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
          onKeyPress={this.handleEnter.bind(this)}
          label='Name' defaultValue={place.name} />
        <Input type='text' ref='descriptionInput'
          onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
          onKeyPress={this.handleEnter.bind(this)}
          label='Short Description' defaultValue={place.description} />
        <Input type='textarea' rows="10" ref='notesInput'
          onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
          label='Notes' defaultValue={place.notes} />
        <hr />
        <ButtonToolbar>
          <Button
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
      </div>
    )
  }

  render () {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
      return this.renderEditing()
    } else {
      window.SCROLLWITHKEYS = true
      return this.renderPlace()
    }
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
