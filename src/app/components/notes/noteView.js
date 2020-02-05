import _ from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button,FormControl, FormGroup, ControlLabel, Glyphicon } from 'react-bootstrap'
import * as NoteActions from 'actions/notes'
import SelectList from 'components/selectList'
import MDdescription from 'components/mdDescription'
import i18n from 'format-message'

class NoteView extends Component {
  constructor (props) {
    super(props)
    this.state = {content: props.note.content, hide: false}
  }

  componentWillUnmount () {
    if (!this.state.hide) this.setState({hide: true})
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
    var title = ReactDOM.findDOMNode(this.refs.titleInput).value || this.props.note.title
    var content = this.state.content
    this.props.actions.editNote(this.props.note.id, {title, content})
  }

  deleteNote = () => {
    let label = i18n("Do you want to delete this note: { title }?", {title: this.props.note.title})
    if (window.confirm(label)) {
      this.props.actions.deleteNote(this.props.note.id)
    }
  }

  renderContent () {
    const { note } = this.props
    return (
      <div className='note-list__content editing'>
        <div className='note-list__note__edit-form'>
          <FormGroup>
            <ControlLabel>{i18n('Title')}</ControlLabel>
            <FormControl
              type='text' ref='titleInput' autoFocus
              onKeyDown={this.handleEsc}
              onKeyPress={this.handleEnter}
              onChange={() => this.setState({unsaved: true})}
              defaultValue={note.title} style={{marginBottom: '10px'}}/>
            <MDdescription
              description={note.content}
              onChange={(desc) => this.setState({content: desc, unsaved: true})}
              useRCE={!this.state.hide}
              labels={{}}
              darkMode={false}
            />
          </FormGroup>
        </div>
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button bsStyle='success'
            onClick={this.saveEdit} >
            {i18n('Save')}
          </Button>
          <Button className='card-dialog__delete'
            onClick={this.deleteNote} >
            {i18n('Delete')}
          </Button>
        </ButtonToolbar>
      </div>
    )
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
