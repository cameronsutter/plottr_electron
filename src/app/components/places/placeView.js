import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { ButtonToolbar, Button, FormControl, ControlLabel, FormGroup,
   Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap'
import * as PlaceActions from 'actions/places'
import i18n from 'format-message'
import RichText from '../rce/RichText'
import ImagePicker from '../images/ImagePicker'
import Image from '../images/Image'

class PlaceView extends Component {
  constructor (props) {
    super(props)
    let description = {}
    props.customAttributes.forEach(attr => {
      const { name } = attr
      description[name] = props.place[name]
    })
    this.state = {
      editing: props.place.name === '',
      notes: props.place.notes,
      description: description,
      newImageId: null,
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

  handleAttrDescriptionChange = (attrName, desc) => {
    let description = {
      ...this.state.description,
    }
    description[attrName] = desc
    this.setState({description: description})
  }

  saveEdit = () => {
    var name = ReactDOM.findDOMNode(this.refs.nameInput).value || this.props.place.name
    var description = ReactDOM.findDOMNode(this.refs.descriptionInput).value
    var notes = this.state.notes
    var attrs = {}
    if (this.state.newImageId) {
      attrs.imageId = this.state.newImageId
    }
    this.props.customAttributes.forEach(attr => {
      const { name, type } = attr
      if (type == 'paragraph') {
        attrs[name] = this.state.description[name]
      } else {
        const val = ReactDOM.findDOMNode(this.refs[`${name}Input`]).value
        attrs[name] = val
      }
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

  renderEditingImage () {
    const { place } = this.props

    let imgId = this.state.newImageId || place.imageId
    return <FormGroup>
      <ControlLabel>{i18n('Place Image')}</ControlLabel>
      <div className='place-list__place__edit-image-wrapper'>
        <div className='place-list__place__edit-image'>
          <Image size='small' shape='rounded' imageId={imgId} />
        </div>
        <div>
          <ImagePicker selectedId={place.imageId} chooseImage={id => this.setState({newImageId: id})} />
        </div>
      </div>
    </FormGroup>
  }

  renderEditingCustomAttributes () {
    const { place, ui, customAttributes } = this.props
    return customAttributes.map((attr, idx) => {
      const { name, type } = attr
      if (type == 'paragraph') {
        return <div key={idx}>
          <ControlLabel>{name}</ControlLabel>
          <RichText
            description={place[name]}
            onChange={(desc) => this.handleAttrDescriptionChange(name, desc)}
            editable
            autofocus={false}
            darkMode={ui.darkMode}
          />
        </div>
      } else {
        return <FormGroup key={idx}>
          <ControlLabel>{name}</ControlLabel>
          <FormControl
            type='text' ref={`${name}Input`}
            defaultValue={place[name]}
            onKeyDown={this.handleEsc}
            onKeyPress={this.handleEnter} />
        </FormGroup>
      }
    })
  }

  renderEditing () {
    const { place, ui } = this.props
    return (
      <div className={cx('place-list__place', 'editing', {darkmode: ui.darkMode})}>
        <div className='place-list__place__edit-form'>
          <div className='place-list__inputs__normal'>
            <FormGroup>
              <ControlLabel>{i18n('Name')}</ControlLabel>
              <FormControl
                type='text' ref='nameInput' autoFocus
                onKeyDown={this.handleEsc}
                onKeyPress={this.handleEnter}
                defaultValue={place.name} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{i18n('Short Description')}</ControlLabel>
              <FormControl type='text' ref='descriptionInput'
                onKeyDown={this.handleEsc}
                onKeyPress={this.handleEnter}
                defaultValue={place.description} />
            </FormGroup>
            { this.renderEditingImage() }
            <FormGroup>
              <ControlLabel>{i18n('Notes')}</ControlLabel>
              <RichText
                description={place.notes}
                onChange={(desc) => this.setState({notes: desc})}
                editable
                autofocus={false}
                darkMode={ui.darkMode}
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
    const { place, customAttributes, ui } = this.props
    const klasses = cx('place-list__place', { darkmode: ui.darkMode })

    const details = customAttributes.map((attr, idx) => {
      const { name, type } = attr
      let desc = <dd>{place[name]}</dd>
      if (type == 'paragraph') {
        desc = <dd>
          <RichText description={place[name]} darkMode={ui.darkMode} />
        </dd>
      }
      return <dl key={idx} className='dl-horizontal'>
        <dt>{name}</dt>
        {desc}
      </dl>
    })
    return <div className={klasses} onClick={() => this.setState({editing: true})}>
      <h4 className='secondary-text'>{place.name}</h4>
      <div className='place-list__place-inner'>
        <div>
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
        <div className='place-list__right-side'>
          <Image responsive imageId={place.imageId} />
          <Glyphicon glyph='pencil' />
        </div>
      </div>
    </div>
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
