import _ from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button,FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import * as NoteActions from 'actions/notes'
import SelectList from 'components/selectList'
import MDdescription from 'components/mdDescription'
import i18n from 'format-message'
import ImagePicker from 'components/images/ImagePicker'
import Image from 'components/images/Image'
import SETTINGS from '../../../common/utils/settings'

class NoteView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      content: props.note.content,
      editing: false,
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

  saveEdit = () => {
    const { note } = this.props
    let title = ReactDOM.findDOMNode(this.refs.titleInput).value || note.title
    let content = this.state.content
    let imageId = this.state.newImageId || note.imageId
    this.props.actions.editNote(note.id, {title, content, imageId})
    this.setState({editing: false})
  }

  deleteNote = () => {
    let label = i18n("Do you want to delete this note: { title }?", {title: this.props.note.title})
    if (window.confirm(label)) {
      this.props.actions.deleteNote(this.props.note.id)
    }
  }

  renderEditingImage () {
    const { note } = this.props
    if (!SETTINGS.get('premiumFeatures') && !note.imageId) return null

    let imgId = this.state.newImageId || note.imageId
    return <FormGroup>
      <ControlLabel>{i18n('Note Image')}</ControlLabel>
      <div className='note-list__note__edit-image-wrapper'>
        <div className='note-list__note__edit-image'>
          <Image size='small' shape='rounded' imageId={imgId}/>
        </div>
        <div>
          {SETTINGS.get('premiumFeatures') || imagesExist ?
            <ImagePicker selectedId={note.imageId} chooseImage={id => this.setState({newImageId: id})} />
          : null}
        </div>
      </div>
    </FormGroup>
  }

  renderContent () {
    const { note } = this.props
    if (this.state.editing) {
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
            <MDdescription
              description={note.content}
              onChange={(desc) => this.setState({content: desc, unsaved: true})}
              useRCE={true}
              labels={{}}
              darkMode={false}
            />
          </FormGroup>
        </div>
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button onClick={() => this.setState({editing: false})}>
            {i18n('Cancel')}
          </Button>
          <Button bsStyle='success' onClick={this.saveEdit}>
            {i18n('Save')}
          </Button>
          <Button className='card-dialog__delete' onClick={this.deleteNote}>
            {i18n('Delete')}
          </Button>
        </ButtonToolbar>
      </div>
    } else {
      let img = null
      if (note.imageId) {
        img = <div className='text-center'>
          <Image size='large' shape='rectangle' imageId={note.imageId} />
        </div>
      }
      return <div className='note-list__content' onClick={() => this.setState({editing: true})}>
        <h4 className='secondary-text'>{note.title}</h4>
        { img }
        <MDdescription
          description={note.content}
          useRCE={false}
          labels={{}}
          darkMode={false}
        />
      </div>
    }
  }

  render () {
    let klasses = 'note-list__note'
    if (this.state.editing) klasses += ' editing'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <div className={klasses}>
        <div className='note-list__body'>
          <div className='note-list__left-side'>
            <SelectList
              parentId={this.props.note.id} type={'Characters'}
              selectedItems={this.props.note.characters}
              allItems={this.props.characters}
              add={this.props.actions.addCharacter}
              remove={this.props.actions.removeCharacter} />
            <SelectList
              parentId={this.props.note.id} type={'Places'}
              selectedItems={this.props.note.places}
              allItems={this.props.places}
              add={this.props.actions.addPlace}
              remove={this.props.actions.removePlace} />
            <SelectList
              parentId={this.props.note.id} type={'Tags'}
              selectedItems={this.props.note.tags}
              allItems={this.props.tags}
              add={this.props.actions.addTag}
              remove={this.props.actions.removeTag} />
          </div>
          {this.renderContent()}
        </div>
      </div>
    )
  }
}

NoteView.propTypes = {
  note: PropTypes.object.isRequired,
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
