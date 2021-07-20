import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import {
  ButtonToolbar,
  Button,
  FormControl,
  ControlLabel,
  FormGroup,
  Glyphicon,
} from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import UnconnectedBookSelectList from '../project/BookSelectList'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedEditAttribute from '../EditAttribute'
import UnconnectedImage from '../images/Image'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedSelectList from '../SelectList'

const PlaceViewConnector = (connector) => {
  const BookSelectList = UnconnectedBookSelectList(connector)
  const EditAttribute = UnconnectedEditAttribute(connector)
  const Image = UnconnectedImage(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const RichText = UnconnectedRichText(connector)
  const SelectList = UnconnectedSelectList(connector)

  const {
    pltr: { helpers },
  } = connector

  class PlaceView extends Component {
    constructor(props) {
      super(props)
      this.state = {
        newImageId: null,
        deleting: false,
      }

      this.nameInputRef = null
      this.descriptionInputRef = null
    }

    componentWillUnmount() {
      if (this.props.editing) this.saveEdit(false)
    }

    deletePlace = (e) => {
      e.stopPropagation()
      this.props.actions.deletePlace(this.props.place.id)
    }

    cancelDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: false })
    }

    handleDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: true })
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

    handleAttrDescriptionChange = (attrName, desc, selection) => {
      const editorPath = helpers.editors.placeCustomAttributeEditorPath(
        this.props.place.id,
        attrName
      )

      this.props.actions.editPlace(
        this.props.place.id,
        helpers.editors.attrIfPresent(attrName, desc),
        editorPath,
        selection
      )
    }

    handleNotesChanged = (value, selection) => {
      this.props.actions.editPlace(
        this.props.place.id,
        helpers.editors.attrIfPresent('notes', value),
        this.props.editorPath,
        this.props.selection
      )
    }

    saveEdit = (close = true) => {
      var name = this.nameInputRef.value || this.props.place.name
      var description = this.descriptionInputRef.value
      var attrs = {}
      if (this.state.newImageId) {
        attrs.imageId = this.state.newImageId == -1 ? null : this.state.newImageId
      }
      this.props.actions.editPlace(this.props.place.id, { name, description, ...attrs })
      if (close) this.props.stopEditing()
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.place.name || i18n('New Place')}
          onDelete={this.deletePlace}
          onCancel={this.cancelDelete}
        />
      )
    }

    renderEditingImage() {
      const { place } = this.props

      let imgId = this.state.newImageId || place.imageId
      return (
        <FormGroup>
          <ControlLabel>{i18n('Place Image')}</ControlLabel>
          <div className="place-list__place__edit-image-wrapper">
            <div className="place-list__place__edit-image">
              <Image size="small" shape="rounded" imageId={imgId} />
            </div>
            <div>
              <ImagePicker
                selectedId={imgId}
                chooseImage={(id) => this.setState({ newImageId: id })}
                deleteButton
              />
            </div>
          </div>
        </FormGroup>
      )
    }

    renderEditingCustomAttributes() {
      const { place, ui, customAttributes } = this.props
      return customAttributes.map((attr, index) => {
        const editorPath = helpers.editors.placeCustomAttributeEditorPath(place.id, attr.name)
        const { name, type } = attr
        return (
          <React.Fragment key={`custom-attribute-${index}-${name}`}>
            <EditAttribute
              index={index}
              entityType="place"
              value={place[name]}
              ui={ui}
              editorPath={editorPath}
              onChange={(desc, selection) =>
                this.handleAttrDescriptionChange(name, desc, selection)
              }
              onSave={this.saveEdit}
              name={name}
              type={type}
            />
          </React.Fragment>
        )
      })
    }

    renderEditing() {
      const { place, ui } = this.props
      return (
        <div className="place-list__place-wrapper">
          <div className={cx('place-list__place', 'editing', { darkmode: ui.darkMode })}>
            <div className="place-list__place__edit-form">
              <div className="place-list__inputs__normal">
                <FormGroup>
                  <ControlLabel>{i18n('Name')}</ControlLabel>
                  <FormControl
                    type="text"
                    inputRef={(ref) => {
                      this.nameInputRef = ref
                    }}
                    autoFocus
                    onKeyDown={this.handleEsc}
                    onKeyPress={this.handleEnter}
                    defaultValue={place.name}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{i18n('Short Description')}</ControlLabel>
                  <FormControl
                    type="text"
                    inputRef={(ref) => {
                      this.descriptionInputRef = ref
                    }}
                    onKeyDown={this.handleEsc}
                    onKeyPress={this.handleEnter}
                    defaultValue={place.description}
                  />
                </FormGroup>
                {this.renderEditingImage()}
                <FormGroup>
                  <ControlLabel>{i18n('Notes')}</ControlLabel>
                  <RichText
                    description={place.notes}
                    onChange={this.handleNotesChanged}
                    selection={this.props.selection}
                    editable
                    autofocus={false}
                    darkMode={ui.darkMode}
                  />
                </FormGroup>
              </div>
              <div className="place-list__inputs__custom">
                {this.renderEditingCustomAttributes()}
              </div>
            </div>
            <ButtonToolbar className="card-dialog__button-bar">
              <Button bsStyle="success" onClick={this.saveEdit}>
                {i18n('Save')}
              </Button>
              <Button className="card-dialog__delete" onClick={this.handleDelete}>
                {i18n('Delete')}
              </Button>
            </ButtonToolbar>
          </div>
        </div>
      )
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

    renderPlace() {
      const { place, customAttributes, ui } = this.props

      const details = customAttributes.map((attr, idx) => {
        const { name, type } = attr
        let desc = <dd>{place[name]}</dd>
        if (type == 'paragraph') {
          desc = (
            <dd>
              <RichText description={place[name]} darkMode={ui.darkMode} />
            </dd>
          )
        }
        return (
          <dl key={idx} className="dl-horizontal">
            <dt>{name}</dt>
            {desc}
          </dl>
        )
      })
      return (
        <div className="place-list__place-wrapper">
          {this.renderDelete()}
          <div className="place-list__place" onClick={this.props.startEditing}>
            <h4 className="secondary-text">{place.name || i18n('New Place')}</h4>
            <div className="place-list__place-inner">
              <div>
                <dl className="dl-horizontal">
                  <dt>{i18n('Description')}</dt>
                  <dd>{place.description}</dd>
                </dl>
                {details}
                <dl className="dl-horizontal">
                  <dt>{i18n('Notes')}</dt>
                  <dd>
                    <RichText description={place.notes} darkMode={this.props.ui.darkMode} />
                  </dd>
                </dl>
              </div>
              <div className="place-list__right-side">
                <Glyphicon glyph="pencil" />
                <Image responsive imageId={place.imageId} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    render() {
      if (this.props.editing) window.SCROLLWITHKEYS = false
      else window.SCROLLWITHKEYS = true

      const { place, tags, actions, ui } = this.props

      return (
        <div className={cx('place-list__place-view', { darkmode: ui.darkMode })}>
          <div className="place-list__place-view__left-side">
            <BookSelectList
              selectedBooks={place.bookIds}
              parentId={place.id}
              add={actions.addBook}
              remove={actions.removeBook}
            />
            <SelectList
              parentId={place.id}
              type={'Tags'}
              selectedItems={place.tags}
              allItems={tags}
              add={actions.addTag}
              remove={actions.removeTag}
            />
          </div>
          <div className="place-list__place-view__right-side">
            {this.props.editing ? this.renderEditing() : this.renderPlace()}
          </div>
        </div>
      )
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
    selection: PropTypes.object.isRequired,
    editorPath: PropTypes.string.isRequired,
    ui: PropTypes.object.isRequired,
    tags: PropTypes.array.isRequired,
    places: PropTypes.array,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  const { sortedTagsSelector } = selectors
  const PlaceActions = actions.place

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        const editorPath = helpers.editors.placeNotesEditorPath(ownProps.place.id)
        return {
          customAttributes: state.present.customAttributes.places,
          cards: state.present.cards,
          notes: state.present.notes,
          ui: state.present.ui,
          editorPath,
          selection: selectors.selectionSelector(state.present, editorPath),
          tags: sortedTagsSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(PlaceActions, dispatch),
        }
      }
    )(PlaceView)
  }

  throw new Error('Could not connect PlaceView')
}

export default PlaceViewConnector
