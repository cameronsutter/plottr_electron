import _ from 'lodash'
import prettydate from 'pretty-date'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Alert, OverlayTrigger, Popover } from 'react-bootstrap'
import * as NoteActions from 'actions/notes'
import NoteView from 'components/notes/noteView'
import FilterList from 'components/filterList'
import Image from 'components/images/Image'
import i18n from 'format-message'
import cx from 'classnames'

class NoteListView extends Component {
  constructor (props) {
    super(props)
    var id = null
    var sortedNotes = []
    if (props.notes.length > 0) {
      sortedNotes = _.sortBy(props.notes, ['lastEdited'])
      sortedNotes.reverse()
      id = sortedNotes[0].id
    }
    this.state = {
      noteDetailId: id,
      filter: null,
      viewableNotes: sortedNotes
    }
  }

  componentWillReceiveProps (nextProps) {
    let viewableNotes = this.viewableNotes(nextProps.notes, this.state.filter)
    const note = nextProps.notes.find(n => n.title === '')
    let noteDetailId = (note && note.id) || (viewableNotes[0] && viewableNotes[0].id)
    this.setState({ noteDetailId, viewableNotes })
  }

  handleCreateNewNote = () => {
    this.props.actions.addNote()
  }

  updateFilter = (filter) => {
    let viewableNotes = this.viewableNotes(this.props.notes, filter)
    let noteDetailId = viewableNotes[0] && viewableNotes[0].id
    this.setState({ viewableNotes, filter, noteDetailId })
  }

  removeFilter = () => {
    this.updateFilter(null)
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
      filter['place'].length === 0 &&
      filter['book'].length === 0)
  }

  isViewable (filter, note) {
    if (!note) return false
    let visible = false
    if (note.tags) {
      if (filter['tag'].some(tId => note.tags.includes(tId))) visible = true
    }
    if (note.characters) {
      if (filter['character'].some(cId => note.characters.includes(cId))) visible = true
    }
    if (note.places) {
      if (filter['place'].some(pId => note.places.includes(pId))) visible = true
    }
    if (note.bookIds) {
      if (filter['book'].some(bookId => note.bookIds.includes(bookId))) visible = true
      // if the filter includes books, and this note has no bookIds,
      // it's considered in all books, so it should be visible
      if (filter['book'].length && !note.bookIds.length) visible = true
    }
    return visible
  }

  renderVisibleNotes () {
    return this.state.viewableNotes.map((n, idx) => {
      let img = null
      if (n.imageId) {
        img = <div className='note-list__item-inner__image-wrapper'>
          <Image responsive imageId={n.imageId} />
        </div>
      }
      let lastEdited = null
      if (n.lastEdited) {
        lastEdited = <p className='list-group-item-text secondary-text'>{prettydate.format(new Date(n.lastEdited))}</p>
      }
      const klasses = cx('list-group-item', {selected: n.id == this.state.noteDetailId})
      return <div key={idx} className={klasses} onClick={() => this.setState({noteDetailId: n.id})}>
        <div className='note-list__item-inner'>
          {img}
          <div>
            <h6 className='list-group-item-heading'>{n.title}</h6>
            { lastEdited }
          </div>
        </div>
      </div>
    })
  }

  renderNotes () {
    let klasses = cx('note-list__list', 'list-group', { darkmode: this.props.ui.darkMode })
    return <div className={klasses}>
      { this.renderVisibleNotes() }
      <a href='#' key={'new-note'} className='note-list__new list-group-item' onClick={this.handleCreateNewNote} >
        <Glyphicon glyph='plus' />
      </a>
    </div>
  }

  renderNoteDetails () {
    if (this.state.noteDetailId == null) return null
    let note = this.props.notes.find(n =>
      n.id === this.state.noteDetailId
    )
    if (!note) note = this.state.viewableNotes[0]
    return <NoteView key={`note-${note.id}`} note={note} />
  }

  renderSubNav () {
    let subNavKlasses = 'subnav__container'
    if (this.props.ui.darkMode) subNavKlasses += ' darkmode'
    let popover = <Popover id='filter'>
      <FilterList filteredItems={this.state.filter} updateItems={this.updateFilter} renderBooks/>
    </Popover>
    let filterDeclaration = <Alert onClick={this.removeFilter} bsStyle="warning"><Glyphicon glyph='remove-sign' />{"  "}{i18n('Notes are filtered')}</Alert>
    if (this.filterIsEmpty(this.state.filter)) {
      filterDeclaration = <span></span>
    }
    return (
      <Navbar className={subNavKlasses}>
        <Nav bsStyle='pills'>
          <NavItem>
            <Button bsSize='small' onClick={this.handleCreateNewNote}><Glyphicon glyph='plus' /> {i18n('New')}</Button>
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={popover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> {i18n('Filter')}</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  render () {
    let klasses = 'secondary-text'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <div className='note-list container-with-sub-nav'>
        {this.renderSubNav()}
        <h1 className={klasses}>{i18n('Notes')}</h1>
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
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    notes: state.notes,
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
)(NoteListView)
