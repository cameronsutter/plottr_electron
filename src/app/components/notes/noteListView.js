import _ from 'lodash'
import prettydate from 'pretty-date'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Alert, OverlayTrigger, Popover, Image } from 'react-bootstrap'
import * as NoteActions from 'actions/notes'
import NoteView from 'components/notes/noteView'
import FilterList from 'components/filterList'
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

  renderVisibleNotes () {
    return this.state.viewableNotes.map((n, idx) => {
      let img = null
      if (n.imageId && this.props.images[n.imageId]) {
        img = <div className='note-list__item-inner__image-wrapper'>
          <Image src={this.props.images[n.imageId].data} responsive/>
        </div>
      }
      let lastEdited = null
      if (n.lastEdited) {
        lastEdited = <p className='list-group-item-text secondary-text'>{prettydate.format(new Date(n.lastEdited))}</p>
      }
      return <div key={idx} className='list-group-item' onClick={() => this.setState({noteDetailId: n.id})}>
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
    let klasses = cx('note-list__list', 'list-group', {
      darkmode: this.props.ui.darkMode,
    })
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
      <FilterList filteredItems={this.state.filter} updateItems={this.updateFilter}/>
    </Popover>
    let filterDeclaration = <Alert bsStyle="warning">{i18n('Notes are filtered')}</Alert>
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
  images: PropTypes.object,
}

function mapStateToProps (state) {
  return {
    notes: state.notes,
    characters: state.characters,
    places: state.places,
    tags: state.tags,
    ui: state.ui,
    images: state.images,
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
