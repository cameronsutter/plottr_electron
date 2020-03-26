import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, FormControl, ControlLabel, FormGroup,
   Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap'
import * as PlaceActions from 'actions/places'
import i18n from 'format-message'
import MDdescription from 'components/mdDescription'
import RichText from '../rce/RichText'

class PlaceView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      editing: props.place.name === '',
      notes: props.place.notes,
    }
  }

  componentWillUnmount () {
    if (this.state.editing) this.saveEdit()
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  handleEsc = (event) => {
    if (event.which === 27) {
      this.saveEdit()
    }
  }

  saveEdit = () => {
    var name = ReactDOM.findDOMNode(this.refs.nameInput).value || this.props.place.name
    var description = ReactDOM.findDOMNode(this.refs.descriptionInput).value
    var notes = this.state.notes
    var attrs = {}
    this.props.customAttributes.forEach(attr => {
      const val = ReactDOM.findDOMNode(this.refs[`${attr}Input`]).value
      attrs[attr] = val
    })
    this.props.actions.editPlace(this.props.place.id, {name, description, notes, ...attrs})
    this.setState({editing: false})
  }

  deletePlace = () => {
    let label = i18n("Do you want to delete this place: { name }?", {name: this.props.place.name})
    if (window.confirm(label)) {
      this.props.actions.deletePlace(this.props.place.id)
    }
  }

  renderEditingCustomAttributes () {
    return this.props.customAttributes.map((attr, idx) =>
      <FormGroup key={idx}>
        <ControlLabel>{attr}</ControlLabel>
        <FormControl
          type='text' ref={`${attr}Input`}
          defaultValue={this.props.place[attr]}
          onKeyDown={this.handleEsc}
          onKeyPress={this.handleEnter} />
      </FormGroup>
    )
  }

  renderEditing () {
    const { place } = this.props
    return (
      <div className='place-list__place editing'>
        <div className='place-list__place__edit-form'>
          <div className='place-list__inputs__normal'>
            <FormGroup>
              <ControlLabel>{i18n('Name')}</ControlLabel>
              <FormControl
                type='text' ref='nameInput' autoFocus
                onKeyDown={this.handleEsc}
                onKeyPress={this.handleEnter}
                defaultValue={place.name} />
              <ControlLabel>{i18n('Short Description')}</ControlLabel>
              <FormControl type='text' ref='descriptionInput'
                onKeyDown={this.handleEsc}
                onKeyPress={this.handleEnter}
                defaultValue={place.description} />
              <ControlLabel>{i18n('Notes')}</ControlLabel>
              <RichText
                description={place.notes}
                onChange={(desc) => this.setState({notes: desc})}
                editable={true}
                autofocus={false}
                darkMode={false}
              />
            </FormGroup>
          </div>
          <div className='place-list__inputs__custom'>
            {this.renderEditingCustomAttributes()}
          </div>
        </div>
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button
            onClick={() => this.setState({editing: false})} >
            {i18n('Cancel')}
          </Button>
          <Button bsStyle='success'
            onClick={this.saveEdit} >
            {i18n('Save')}
          </Button>
          <Button className='card-dialog__delete'
            onClick={this.deletePlace} >
            {i18n('Delete')}
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
    let label = i18n(`{
      count, plural,
        one {1 card}
        other {# cards}
    }`, { count: this.props.place.cards.length })
    let cardsAssoc = this.props.place.cards.reduce((arr, cId) => {
      let card = _.find(this.props.cards, {id: cId})
      if (card) return arr.concat(card.title)
      return arr
    }, []).join(', ')
    let tooltip = <Tooltip id='card-association-tooltip'>{cardsAssoc}</Tooltip>
    return <OverlayTrigger placement='top' overlay={tooltip} key='card-association'>
      <span>{label}</span>
    </OverlayTrigger>
  }

  renderNoteAssociations () {
    let label = i18n(`{
      count, plural,
        one {1 note}
        other {# notes}
    }`, { count: this.props.place.noteIds.length })
    let noteAssoc = this.props.place.noteIds.reduce((arr, nId) => {
      let note = _.find(this.props.notes, {id: nId})
      if (note) return arr.concat(note.title)
      return arr
    }, []).join(', ')
    let tooltip = <Tooltip id='notes-association-tooltip'>{noteAssoc}</Tooltip>
    return <OverlayTrigger placement='top' overlay={tooltip} key='note-association'>
      <span>{label}</span>
    </OverlayTrigger>
  }

  renderPlace () {
    let klasses = 'character-list__character'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    const { place } = this.props
    const details = this.props.customAttributes.map((attr, idx) =>
      <dl key={idx} className='dl-horizontal'>
        <dt>{attr}</dt>
        <dd>{place[attr]}</dd>
      </dl>
    )
    return (
      <div className={klasses} onClick={() => this.setState({editing: true})}>
        <h4 className='text-center secondary-text'>{place.name}</h4>
        <dl className='dl-horizontal'>
          <dt>{i18n('Description')}</dt>
          <dd>{place.description}</dd>
        </dl>
        {details}
        <dl className='dl-horizontal'>
          <dt>{i18n('Notes')}</dt>
          <dd>
            <RichText
              description={place.notes}
              editable={false}
              darkMode={this.props.ui.darkMode}
            />
          </dd>
        </dl>
        <dl className='dl-horizontal'>
          <dt>{i18n('Attached to')}</dt>
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
  notes: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    customAttributes: state.customAttributes['places'],
    cards: state.cards,
    notes: state.notes,
    ui: state.ui,
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
