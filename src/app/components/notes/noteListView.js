import { sortBy } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Glyphicon,
  Nav,
  NavItem,
  Button,
  Alert,
  OverlayTrigger,
  Popover,
  Grid,
  Row,
  Col,
} from 'react-bootstrap'
import NoteView from 'components/notes/noteView'
import FilterList from 'components/filterList'
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'
import ErrorBoundary from '../../containers/ErrorBoundary'
import NoteItem from './NoteItem'
import { newIds, actions } from 'pltr/v2'
import SubNav from '../../containers/SubNav'
import { preventLeaveOnHotlink } from '../../middlewares/helpers'

const { nextId } = newIds

const NoteActions = actions.note

class NoteListView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      noteDetailId: null,
      filter: null,
      viewableNotes: [],
      editingSelected: false,
    }
  }

  componentDidMount() {
    preventLeaveOnHotlink()
  }

  componentDidUpdate() {
    preventLeaveOnHotlink()
  }

  static getDerivedStateFromProps(props, state) {
    let returnVal = { ...state }
    const { notes } = props
    const viewableNotes = NoteListView.viewableNotes(notes, state.filter)
    returnVal.viewableNotes = viewableNotes
    returnVal.noteDetailId = NoteListView.detailID(viewableNotes, state.noteDetailId)

    return returnVal
  }

  static detailID(notes, noteDetailId) {
    if (notes.length == 0) return null

    let id = notes[0].id

    // check for the currently active one
    if (noteDetailId != null) {
      let activeNote = notes.find((n) => n.id === noteDetailId)
      if (activeNote) id = activeNote.id
    }

    return id
  }

  handleCreateNewNote = () => {
    const id = nextId(this.props.notes)
    this.props.actions.addNote()
    this.setState({ noteDetailId: id, editingSelected: true })
  }

  updateFilter = (filter) => {
    this.setState({ filter })
  }

  removeFilter = () => {
    this.updateFilter(null)
  }

  static viewableNotes(notes, filter) {
    const filterIsEmpty = NoteListView.staticFilterIsEmpty(filter)
    let viewableNotes = notes
    if (!filterIsEmpty) {
      viewableNotes = notes.filter((n) => NoteListView.isViewable(filter, n))
    }
    let sortedNotes = sortBy(viewableNotes, ['lastEdited'])
    sortedNotes.reverse()
    return sortedNotes
  }

  // this is a hack for now
  static staticFilterIsEmpty(filter) {
    return (
      filter == null ||
      (filter['tag'].length === 0 &&
        filter['character'].length === 0 &&
        filter['place'].length === 0 &&
        filter['book'].length === 0)
    )
  }

  filterIsEmpty(filter) {
    return (
      filter == null ||
      (filter['tag'].length === 0 &&
        filter['character'].length === 0 &&
        filter['place'].length === 0 &&
        filter['book'].length === 0)
    )
  }

  static isViewable(filter, note) {
    if (!note) return false
    let visible = false
    if (note.tags) {
      if (filter['tag'].some((tId) => note.tags.includes(tId))) visible = true
    }
    if (note.characters) {
      if (filter['character'].some((cId) => note.characters.includes(cId))) visible = true
    }
    if (note.places) {
      if (filter['place'].some((pId) => note.places.includes(pId))) visible = true
    }
    if (note.bookIds) {
      if (filter['book'].some((bookId) => note.bookIds.includes(bookId))) visible = true
      // if the filter includes books, and this note has no bookIds,
      // it's considered in all books, so it should be visible
      if (filter['book'].length && !note.bookIds.length) visible = true
    }
    return visible
  }

  editingSelected = () => {
    this.setState({ editingSelected: true })
  }

  stopEditing = () => {
    this.setState({ editingSelected: false })
  }

  renderVisibleNotes() {
    return this.state.viewableNotes.map((n) => (
      <NoteItem
        key={n.id}
        note={n}
        selected={n.id == this.state.noteDetailId}
        startEdit={this.editingSelected}
        stopEdit={this.stopEditing}
        select={() => this.setState({ noteDetailId: n.id })}
      />
    ))
  }

  renderNotes() {
    return (
      <div className={cx('note-list__list', 'list-group', { darkmode: this.props.ui.darkMode })}>
        {this.renderVisibleNotes()}
      </div>
    )
  }

  renderNoteDetails() {
    if (this.state.noteDetailId == null) return null
    let note = this.props.notes.find((n) => n.id === this.state.noteDetailId)
    if (!note) note = this.state.viewableNotes[0]
    return (
      <ErrorBoundary>
        <NoteView
          key={`note-${note.id}`}
          note={note}
          editing={this.state.editingSelected}
          stopEditing={this.stopEditing}
          startEditing={this.editingSelected}
        />
      </ErrorBoundary>
    )
  }

  renderSubNav() {
    let popover = (
      <Popover id="filter">
        <FilterList filteredItems={this.state.filter} updateItems={this.updateFilter} renderBooks />
      </Popover>
    )
    let filterDeclaration = (
      <Alert onClick={this.removeFilter} bsStyle="warning">
        <Glyphicon glyph="remove-sign" />
        {'  '}
        {i18n('Notes are filtered')}
      </Alert>
    )
    if (this.filterIsEmpty(this.state.filter)) {
      filterDeclaration = <span></span>
    }
    return (
      <SubNav>
        <Nav bsStyle="pills">
          <NavItem>
            <Button bsSize="small" onClick={this.handleCreateNewNote}>
              <Glyphicon glyph="plus" /> {i18n('New')}
            </Button>
          </NavItem>
          <NavItem>
            <OverlayTrigger
              containerPadding={20}
              trigger="click"
              rootClose
              placement="bottom"
              overlay={popover}
            >
              <Button bsSize="small">
                <Glyphicon glyph="filter" /> {i18n('Filter')}
              </Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
        </Nav>
      </SubNav>
    )
  }

  render() {
    return (
      <div className="note-list container-with-sub-nav">
        {this.renderSubNav()}
        <Grid fluid className="tab-body">
          <Row>
            <Col sm={3}>
              <h1 className={cx('secondary-text', { darkmode: this.props.ui.darkMode })}>
                {i18n('Notes')}{' '}
                <Button onClick={this.handleCreateNewNote}>
                  <Glyphicon glyph="plus" />
                </Button>
              </h1>
              {this.renderNotes()}
            </Col>
            <Col sm={9}>{this.renderNoteDetails()}</Col>
          </Row>
        </Grid>
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

function mapStateToProps(state) {
  return {
    notes: state.present.notes,
    characters: state.present.characters,
    places: state.present.places,
    tags: state.present.tags,
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(NoteActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NoteListView)
