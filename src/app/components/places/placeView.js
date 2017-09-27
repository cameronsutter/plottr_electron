import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, Input, Label, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap'
import * as PlaceActions from 'actions/places'

class PlaceView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: props.place.name === ''}
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  saveEdit = () => {
    var name = this.refs.nameInput.getValue() || this.props.place.name
    var description = this.refs.descriptionInput.getValue()
    var notes = this.refs.notesInput.getValue()
    var attrs = {}
    this.props.customAttributes.forEach(attr => {
      const val = this.refs[`${attr}Input`].getValue()
      attrs[attr] = val
    })
    this.props.actions.editPlace(this.props.place.id, {name, description, notes, ...attrs})
    this.setState({editing: false})
  }

  deletePlace = () => {
    this.props.actions.deletePlace(this.props.place.id)
  }

  renderEditingCustomAttributes () {
    return this.props.customAttributes.map((attr, idx) =>
      <Input key={idx}
        type='text' label={attr} ref={`${attr}Input`}
        defaultValue={this.props.place[attr]}
        onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
        onKeyPress={this.handleEnter} />
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
              onKeyPress={this.handleEnter}
              label='Name' defaultValue={place.name} />
            <Input type='text' ref='descriptionInput'
              onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
              onKeyPress={this.handleEnter}
              label='Short Description' defaultValue={place.description} />
            <Input type='textarea' rows='10' ref='notesInput'
              onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
              label='Notes' defaultValue={place.notes} />
          </div>
          <div className='place-list__inputs__custom'>
            {this.renderEditingCustomAttributes()}
          </div>
        </div>
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button
            onClick={() => this.setState({editing: false})} >
            Cancel
          </Button>
          <Button bsStyle='success'
            onClick={this.saveEdit} >
            Save
          </Button>
          <Button className='card-dialog__delete'
            onClick={this.deletePlace} >
            Delete
          </Button>
        </ButtonToolbar>
      </div>
    )
  }

  renderAssociations () {
    let cards = null
    let notes = null
    if (this.props.place.cards.length > 0) {
      cards = this.renderCardAssociations()
    }
    if (this.props.place.noteIds.length > 0) {
      notes = this.renderNoteAssociations()
    }
    if (cards && notes) {
      return [cards, <span key='ampersand'> & </span>, notes]
    } else {
      return cards || notes
    }
  }

  renderCardAssociations () {
    let label = 'cards'
    if (this.props.place.cards.length === 1) label = 'card'
    let cardsAssoc = this.props.place.cards.map(cId =>
      _.find(this.props.cards, {id: cId}).title
    ).join(', ')
    let tooltip = <Tooltip id='card-association-tooltip'>{cardsAssoc}</Tooltip>
    return <OverlayTrigger placement='top' overlay={tooltip} key='card-association'>
      <span>{this.props.place.cards.length} {label}</span>
    </OverlayTrigger>
  }

  renderNoteAssociations () {
    let label = 'notes'
    if (this.props.place.noteIds.length === 1) label = 'note'
    let noteAssoc = this.props.place.noteIds.map(nId =>
      _.find(this.props.notes, {id: nId}).title
    ).join(', ')
    let tooltip = <Tooltip id='notes-association-tooltip'>{noteAssoc}</Tooltip>
    return <OverlayTrigger placement='top' overlay={tooltip} key='note-association'>
      <span>{this.props.place.noteIds.length} {label}</span>
    </OverlayTrigger>
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
        <dl className='dl-horizontal'>
          <dt>Attached to</dt>
          <dd>{this.renderAssociations()}</dd>
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
  cards: PropTypes.array.isRequired,
  notes: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    customAttributes: state.customAttributes['places'],
    cards: state.cards,
    notes: state.notes
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
