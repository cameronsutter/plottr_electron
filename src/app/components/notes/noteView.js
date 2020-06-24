import _ from 'lodash'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button,FormControl, FormGroup, ControlLabel, Glyphicon } from 'react-bootstrap'
import * as NoteActions from 'actions/notes'
import SelectList from 'components/selectList'
import i18n from 'format-message'
import RichText from '../rce/RichText'
import ImagePicker from 'components/images/ImagePicker'
import Image from 'components/images/Image'
import BookSelectList from '../story/BookSelectList'
import cx from 'classnames'

class NoteView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      content: props.note.content,
      newImageId: null,
    }
  }

  componentWillUnmount () {
    if (this.props.editing) this.saveEdit(false)
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

  saveEdit = (close = true) => {
    const { note } = this.props
    let title = findDOMNode(this.refs.titleInput).value || note.title
    let content = this.state.content
    let attrs = {title, content}
    if (this.state.newImageId) {
      attrs.imageId = this.state.newImageId == -1 ? null : this.state.newImageId
    }
    this.props.actions.editNote(note.id, attrs)
    if (close) this.props.stopEditing()
  }

  renderBookSelectList () {
    const { note, actions } = this.props

    return <BookSelectList
      selectedBooks={note.bookIds}
      parentId={note.id}
      add={actions.addBook}
      remove={actions.removeBook}
    />
  }

  renderEditingImage () {
    const { note } = this.props

    let imgId = this.state.newImageId || note.imageId
    return <FormGroup>
      <ControlLabel>{i18n('Note Image')}</ControlLabel>
      <div className='note-list__note__edit-image-wrapper'>
        <div className='note-list__note__edit-image'>
          <Image size='small' shape='rounded' imageId={imgId}/>
        </div>
        <div>
          <ImagePicker selectedId={imgId} chooseImage={id => this.setState({newImageId: id})} deleteButton />
        </div>
      </div>
    </FormGroup>
  }

  renderContent () {
    const { note, ui } = this.props
    if (this.props.editing) {
      return <div className='note-list__content editing'>
        <div className='note-list__note__edit-form'>
          <FormGroup>
            <ControlLabel>{i18n('Title')}</ControlLabel>
            <FormControl
              type='text' ref='titleInput' autoFocus
              onKeyDown={this.handleEsc}
              onKeyPress={this.handleEnter}
              onChange={() => this.setState({unsaved: true})}
              defaultValue={note.title} style={{marginBottom: '10px'}}/>
          </FormGroup>
          { this.renderEditingImage() }
          <FormGroup>
            <ControlLabel>{i18n('Content')}</ControlLabel>
            <RichText
              description={note.content}
              onChange={(desc) => this.setState({content: desc})}
              editable
              autofocus={false}
              darkMode={ui.darkMode}
            />
          </FormGroup>
        </div>
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button bsStyle='success' onClick={this.saveEdit}>
            {i18n('Save')}
          </Button>
        </ButtonToolbar>
      </div>
    } else {
      let img = null
      if (note.imageId) {
        img = <div className='text-center'>
          <Image responsive imageId={note.imageId} />
        </div>
      }
      return <div className='note-list__content' onClick={this.props.startEditing}>
        <h4 className='secondary-text'>{note.title || i18n('New Note')}</h4>
        { img }
        <RichText description={note.content} darkMode={ui.darkMode} />
        <Glyphicon className='pull-right' glyph='pencil' />
      </div>
    }
  }

  render () {
    const { editing, ui, note, characters, actions, places, tags } = this.props
    return <div className='note-list__note-wrapper'>
      <div className={cx('note-list__note', {editing: editing, darkmode: ui.darkMode})}>
        <div className='note-list__body'>
          <div className='note-list__left-side'>
            { this.renderBookSelectList() }
            <SelectList
              parentId={note.id} type={'Characters'}
              selectedItems={note.characters}
              allItems={characters}
              add={actions.addCharacter}
              remove={actions.removeCharacter} />
            <SelectList
              parentId={note.id} type={'Places'}
              selectedItems={note.places}
              allItems={places}
              add={actions.addPlace}
              remove={actions.removePlace} />
            <SelectList
              parentId={note.id} type={'Tags'}
              selectedItems={note.tags}
              allItems={tags}
              add={actions.addTag}
              remove={actions.removeTag} />
          </div>
          {this.renderContent()}
        </div>
      </div>
    </div>
  }
}

NoteView.propTypes = {
  note: PropTypes.object.isRequired,
  editing: PropTypes.bool.isRequired,
  startEditing: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    characters: state.characters,
    places: state.places,
    tags: state.tags,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(NoteActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoteView)
