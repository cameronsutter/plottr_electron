import _ from 'lodash'
import prettydate from 'pretty-date'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Label } from 'react-bootstrap'
import Modal from 'react-modal'
import * as NoteActions from 'actions/notes'
import NoteView from 'components/notes/noteView'

const modalStyles = {content: {top: '70px'}}

class NoteListView extends Component {

  constructor (props) {
    super(props)
    const sortedNotes = _.sortBy(props.notes, ['lastEdited'])
    sortedNotes.reverse()
    this.state = {noteDetailId: sortedNotes[0].id}
  }

  componentWillReceiveProps (nextProps) {
    const note = nextProps.notes.find(n =>
      n.title === ''
    )
    if (note) this.setState({noteDetailId: note.id})
  }

  handleCreateNewNote () {
    this.props.actions.addNote()
  }

  renderNotes () {
    const sortedNotes = _.sortBy(this.props.notes, ['lastEdited'])
    sortedNotes.reverse()
    const notes = sortedNotes.map((n, idx) =>
      <a href='#' key={idx} className='list-group-item' onClick={() => this.setState({noteDetailId: n.id})}>
        <h6 className='list-group-item-heading'>{n.title}</h6>
        <p className='list-group-item-text secondary-text'>{prettydate.format(new Date(n.lastEdited))}</p>
      </a>
    )
    return (<div className='note-list__list list-group'>
        {notes}
        <a href='#' key={'new-note'} className='note-list__new list-group-item' onClick={this.handleCreateNewNote.bind(this)} >
          <Glyphicon glyph='plus' />
        </a>
      </div>)
  }

  renderNoteDetails () {
    const note = this.props.notes.find(n =>
      n.id === this.state.noteDetailId
    )
    return <NoteView key={`note-${note.id}`} note={note} />
  }

  render () {
    return (
      <div className='note-list'>
        <h1 className='secondary-text'>Notes</h1>
        {this.renderNoteDetails()}
        {this.renderNotes()}
      </div>
    )
  }
}

NoteListView.propTypes = {
  notes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    notes: state.notes
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
)(NoteListView)
