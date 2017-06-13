import _ from 'lodash'
import prettydate from 'pretty-date'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Alert, OverlayTrigger, Popover } from 'react-bootstrap'
import Modal from 'react-modal'
import * as NoteActions from 'actions/notes'
import NoteView from 'components/notes/noteView'
import FilterList from 'components/filterList'

const modalStyles = {content: {top: '70px'}}

class NoteListView extends Component {

  constructor (props) {
    super(props)
    const sortedNotes = _.sortBy(props.notes, ['lastEdited'])
    sortedNotes.reverse()
    this.state = {
      noteDetailId: sortedNotes[0].id,
      filter: null,
      viewableNotes: sortedNotes}
  }

  componentWillReceiveProps (nextProps) {
    let viewableNotes = this.viewableNotes(nextProps.notes, this.state.filter)
    const note = nextProps.notes.find(n => n.title === '')
    let noteDetailId = (note && note.id) || (viewableNotes[0] && viewableNotes[0].id)
    this.setState({ noteDetailId, viewableNotes })
  }

  handleCreateNewNote () {
    this.props.actions.addNote()
  }

  updateFilter (filter) {
    let viewableNotes = this.viewableNotes(this.props.notes, filter)
    let noteDetailId = viewableNotes[0] && viewableNotes[0].id
    this.setState({ viewableNotes, filter, noteDetailId })
  }

  viewableNotes (notes, filter) {
    const filterIsEmpty = this.filterIsEmpty(filter)
    let viewableNotes = notes
    if (!filterIsEmpty) {
      viewableNotes = notes.filter((n) => this.isViewable(filter, n))
    }
    let sortedNotes = _.sortBy(viewableNotes, ['lastEdited'])
    sortedNotes.reverse()
    return sortedNotes
  }

  filterIsEmpty (filter) {
    return filter == null ||
      (filter['tag'].length === 0 &&
      filter['character'].length === 0 &&
      filter['place'].length === 0)
  }

  isViewable (filter, note) {
    if (!note) return false
    var filtered = false
    if (note.tags) {
      note.tags.forEach((tId) => {
        if (filter['tag'].includes(tId)) filtered = true
      })
    }
    if (note.characters) {
      note.characters.forEach((cId) => {
        if (filter['character'].includes(cId)) filtered = true
      })
    }
    if (note.places) {
      note.places.forEach((pId) => {
        if (filter['place'].includes(pId)) filtered = true
      })
    }
    return filtered
  }

  renderNotes () {
    const notes = this.state.viewableNotes.map((n, idx) =>
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
    if (this.state.noteDetailId == null) return null
    const note = this.props.notes.find(n =>
      n.id === this.state.noteDetailId
    )
    return <NoteView key={`note-${note.id}`} note={note} />
  }

  renderSubNav () {
    let popover = <Popover id='filter'>
      <FilterList filteredItems={this.state.filter} updateItems={this.updateFilter.bind(this)}/>
    </Popover>
    let filterDeclaration = <Alert bsStyle="warning">Notes are filtered</Alert>
    if (this.filterIsEmpty(this.state.filter)) {
      filterDeclaration = <span></span>
    }
    return (
      <Navbar className='subnav__container'>
        <Nav bsStyle='pills' >
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={popover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> Filter</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  render () {
    return (
      <div className='note-list container-with-sub-nav'>
        {this.renderSubNav()}
        <h1 className='secondary-text'>Notes</h1>
        {this.renderNoteDetails()}
        {this.renderNotes()}
      </div>
    )
  }
}

NoteListView.propTypes = {
  notes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
}

function mapStateToProps (state) {
  return {
    notes: state.notes,
    characters: state.characters,
    places: state.places,
    tags: state.tags
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
