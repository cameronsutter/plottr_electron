import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { ButtonToolbar, Button, FormControl, ControlLabel, FormGroup, Glyphicon } from 'react-bootstrap'
import * as PlaceActions from 'actions/places'
import i18n from 'format-message'
import RichText from '../rce/RichText'
import ImagePicker from '../images/ImagePicker'
import Image from '../images/Image'
import SelectList from '../selectList'
import BookSelectList from '../story/BookSelectList'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import { sortedTagsSelector } from '../../selectors/tags'

class PlaceView extends Component {
  constructor (props) {
    super(props)
    let description = {}
    props.customAttributes.forEach(attr => {
      const { name } = attr
      description[name] = props.place[name]
    })
    this.state = {
      notes: props.place.notes,
      description: description,
      newImageId: null,
      deleting: false,
    }
  }

  componentWillUnmount () {
    if (this.props.editing) this.saveEdit(false)
  }

  deletePlace = e => {
    e.stopPropagation()
    this.props.actions.deletePlace(this.props.place.id)
  }

  cancelDelete = e => {
    e.stopPropagation()
    this.setState({deleting: false})
  }

  handleDelete = e => {
    e.stopPropagation()
    this.setState({deleting: true})
    this.props.stopEditing()
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

  saveEdit = (close = true) => {
    var name = findDOMNode(this.refs.nameInput).value || this.props.place.name
    var description = findDOMNode(this.refs.descriptionInput).value
    var notes = this.state.notes
    var attrs = {}
    if (this.state.newImageId) {
      attrs.imageId = this.state.newImageId == -1 ? null : this.state.newImageId
    }
    this.props.customAttributes.forEach(attr => {
      const { name, type } = attr
      if (type == 'paragraph') {
        attrs[name] = this.state.description[name]
      } else {
        const val = findDOMNode(this.refs[`${name}Input`]).value
        attrs[name] = val
      }
    })
    this.props.actions.editPlace(this.props.place.id, {name, description, notes, ...attrs})
    if (close) this.props.stopEditing()
  }


  renderDelete () {
    if (!this.state.deleting) return null

    return <DeleteConfirmModal name={this.props.place.name || i18n('New Place')} onDelete={this.deletePlace} onCancel={this.cancelDelete}/>
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
          <ImagePicker selectedId={imgId} chooseImage={id => this.setState({newImageId: id})} deleteButton />
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
    return <div className='place-list__place-wrapper'>
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
          <Button bsStyle='success'
            onClick={this.saveEdit} >
            {i18n('Save')}
          </Button>
          <Button className='card-dialog__delete' onClick={this.handleDelete}>
            {i18n('Delete')}
          </Button>
        </ButtonToolbar>
      </div>
    </div>
  }

  // renderAssociations () {
  //   let cards = null
  //   let notes = null
  //   if (this.props.place.cards.length > 0) {
  //     cards = this.renderCardAssociations()
  //   }
  //   if (this.props.place.noteIds.length > 0) {
  //     notes = this.renderNoteAssociations()
  //   }
  //   if (cards && notes) {
  //     return [cards, <span key='ampersand'> & </span>, notes]
  //   } else {
  //     return cards || notes
  //   }
  // }

  // renderCardAssociations () {
  //   if (!this.props.place.cards) return null
  //   if (!this.props.place.cards.length) return null

  //   let label = i18n(`{
  //     count, plural,
  //       one {1 card}
  //       other {# cards}
  //   }`, { count: this.props.place.cards.length })
  //   let cardsAssoc = this.props.place.cards.reduce((arr, cId) => {
  //     let card = this.props.cards.find(c => c.id == cId)
  //     if (card) return arr.concat(card.title)
  //     return arr
  //   }, []).join(', ')
  //   let tooltip = <Tooltip id='card-association-tooltip'>{cardsAssoc}</Tooltip>
  //   return <OverlayTrigger placement='top' overlay={tooltip} key='card-association'>
  //     <span>{label}</span>
  //   </OverlayTrigger>
  // }

  // renderNoteAssociations () {
  //   if (!this.props.place.noteIds) return null
  //   if (!this.props.place.noteIds.length) return null

  //   let label = i18n(`{
  //     count, plural,
  //       one {1 note}
  //       other {# notes}
  //   }`, { count: this.props.place.noteIds.length })
  //   let noteAssoc = this.props.place.noteIds.reduce((arr, nId) => {
  //     let note = this.props.notes.find(n => n.id == nId)
  //     if (note) return arr.concat(note.title)
  //     return arr
  //   }, []).join(', ')
  //   let tooltip = <Tooltip id='notes-association-tooltip'>{noteAssoc}</Tooltip>
  //   return <OverlayTrigger placement='top' overlay={tooltip} key='note-association'>
  //     <span>{label}</span>
  //   </OverlayTrigger>
  // }

  renderPlace () {
    const { place, customAttributes, ui } = this.props

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
    return <div className='place-list__place-wrapper'>
      { this.renderDelete() }
      <div className='place-list__place' onClick={this.props.startEditing}>
        <h4 className='secondary-text'>{place.name || i18n('New Place')}</h4>
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
          </div>
          <div className='place-list__right-side'>
            <Glyphicon glyph='pencil' />
            <Image responsive imageId={place.imageId} />
          </div>
        </div>
      </div>
    </div>
  }

  render () {
    if (this.props.editing) window.SCROLLWITHKEYS = false
    else window.SCROLLWITHKEYS = true

    const { place, tags, actions, ui } = this.props

    return <div className={cx('place-list__place-view', { darkmode: ui.darkMode })}>
      <div className='place-list__place-view__left-side'>
        <BookSelectList
          selectedBooks={place.bookIds}
          parentId={place.id}
          add={actions.addBook}
          remove={actions.removeBook}
        />
        <SelectList
          parentId={place.id} type={'Tags'}
          selectedItems={place.tags}
          allItems={tags}
          add={actions.addTag}
          remove={actions.removeTag}
        />
      </div>
      <div className='place-list__place-view__right-side'>
        { this.props.editing ? this.renderEditing() : this.renderPlace() }
      </div>
    </div>
  }
}

PlaceView.propTypes = {
  place: PropTypes.object.isRequired,
  editing: PropTypes.bool.isRequired,
  startEditing: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributes: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  notes: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
}

function mapStateToProps (state) {
  return {
    customAttributes: state.present.customAttributes.places,
    cards: state.present.cards,
    notes: state.present.notes,
    ui: state.present.ui,
    tags: sortedTagsSelector(state.present),
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
