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
    var name = this.refs.nameInput.getValue() || this.props.place.name
    var description = this.refs.descriptionInput.getValue() || this.props.place.description
    var notes = this.refs.notesInput.getValue() || this.props.place.notes
    var attrs = {}
    this.props.customAttributes.forEach(attr => {
      const val = this.refs[`${attr}Input`].getValue() || this.props.place[attr]
      attrs[attr] = val
    })
    this.props.actions.editPlace(this.props.place.id, {name, description, notes, ...attrs})
    this.setState({editing: false})
  }

  renderEditingCustomAttributes () {
    return this.props.customAttributes.map((attr, idx) =>
      <Input key={idx}
        type='text' label={attr} ref={`${attr}Input`}
        defaultValue={this.props.place[attr]}
        onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
        onKeyPress={this.handleEnter.bind(this)} />
    )
  }

  renderEditing () {
    const { place } = this.props
    return (
      <div className='place-list__place'>
        <div className='place-list__place__edit-form'>
          <div className='place-list__inputs__normal'>
            <Input
              type='text' ref='nameInput' autoFocus
              onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
              onKeyPress={this.handleEnter.bind(this)}
              label='Name' defaultValue={place.name} />
            <Input type='text' ref='descriptionInput'
              onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
              onKeyPress={this.handleEnter.bind(this)}
              label='Short Description' defaultValue={place.description} />
            <Input type='textarea' rows='10' ref='notesInput'
              onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
              label='Notes' defaultValue={place.notes} />
          </div>
          <div className='place-list__inputs__custom'>
            {this.renderEditingCustomAttributes()}
          </div>
        </div>
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
    const { place } = this.props
    const details = this.props.customAttributes.map((attr, idx) =>
      <dl key={idx} className='dl-horizontal'>
        <dt>{attr}</dt>
        <dd>{place[attr]}</dd>
      </dl>
    )
    return (
      <div className='character-list__character' onClick={() => this.setState({editing: true})}>
        <h4 className='text-center secondary-text'>{place.name}</h4>
        <dl className='dl-horizontal'>
          <dt>Description</dt>
          <dd>{place.description}</dd>
        </dl>
        {details}
        <dl className='dl-horizontal'>
          <dt>Notes</dt>
          <dd>{place.notes}</dd>
        </dl>
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
  actions: PropTypes.object.isRequired,
  customAttributes: PropTypes.array.isRequired,
}

function mapStateToProps (state) {
  return {
    customAttributes: state.customAttributes['places'],
  }
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
