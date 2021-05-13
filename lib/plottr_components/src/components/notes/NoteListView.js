import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
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
import UnconnectedNoteView from './NoteView'
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedFilterList from '../filterLists/FilterList'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedNoteItem from './NoteItem'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import UnconnectedSortList from '../SortList'
import NoteCategoriesModalConnector from './NoteCategoriesModal'
import { newIds } from 'pltr/v2'

const { nextId } = newIds

const NoteListViewConnector = (connector) => {
  const SortList = UnconnectedSortList(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const NoteView = UnconnectedNoteView(connector)
  const NoteCategoriesModal = NoteCategoriesModalConnector(connector)
  const SubNav = UnconnectedSubNav(connector)
  const NoteItem = UnconnectedNoteItem(connector)
  const FilterList = UnconnectedFilterList(connector)
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)

  class NoteListView extends Component {
    constructor(props) {
      super(props)
      this.state = {
        noteDetailId: null,
        filter: null,
        viewableNotes: [],
        editingSelected: false,
        categoriesDialogOpen: false,
      }
    }

    static getDerivedStateFromProps(props, state) {
      let returnVal = { ...state }
      const { notes, visibleNotesByCategory, categories } = props
      returnVal.noteDetailId = NoteListView.detailID(
        visibleNotesByCategory,
        notes,
        categories,
        state.noteDetailId
      )

      return returnVal
    }

    static detailID(notesByCategory, notes, categories, noteDetailId) {
      if (!notes.length) return null
      if (!Object.keys(notesByCategory).length) return null
      const allCategories = [...categories, { id: null }] // uncategorized

      // check for the currently active one
      if (noteDetailId != null) {
        const isVisible = allCategories.some((cat) => {
          if (!notesByCategory[cat.id] || !notesByCategory[cat.id].length) return false
          return notesByCategory[cat.id].some((note) => note.id == noteDetailId)
        })
        if (isVisible) return noteDetailId
      }

      // default to first one in the first category
      const firstCategoryWithNote = allCategories.find(
        (cat) => notesByCategory[cat.id] && notesByCategory[cat.id].length
      )
      if (firstCategoryWithNote)
        return (
          notesByCategory[firstCategoryWithNote.id][0] &&
          notesByCategory[firstCategoryWithNote.id][0].id
        )

      return null
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
      return viewableNotes
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

    startEditing = () => {
      this.setState({ editingSelected: true })
    }

    stopEditing = () => {
      this.setState({ editingSelected: false })
    }

    closeDialog = () => {
      this.setState({ attributesDialogOpen: false })
      this.setState({ categoriesDialogOpen: false })
    }

    renderCustomAttributes() {
      if (!this.state.attributesDialogOpen) return null

      return <CustomAttributeModal type="notes" closeDialog={this.closeDialog} hideSaveAsTemplate />
    }

    renderCategoriesModal() {
      if (!this.state.categoriesDialogOpen) return null
      return <NoteCategoriesModal closeDialog={this.closeDialog} />
    }

    renderVisibleNotes(categoryId) {
      const { visibleNotesByCategory } = this.props
      if (!visibleNotesByCategory[categoryId]) return []

      return visibleNotesByCategory[categoryId].map((n) => (
        <NoteItem
          key={n.id}
          note={n}
          selected={n.id == this.state.noteDetailId}
          startEdit={this.startEditing}
          stopEdit={this.stopEditing}
          select={() => this.setState({ noteDetailId: n.id })}
        />
      ))
    }

    renderNotes() {
      let categories = [...this.props.categories]
      categories.push({ id: null, name: i18n('Uncategorized') })

      return categories.map((cat) => this.renderCategory(cat))
    }

    renderCategory(category) {
      const notesInCategory = this.renderVisibleNotes(category.id)
      if (!notesInCategory.length) return null
      return (
        <div key={`category-${category.id}`}>
          <h2>{category.name}</h2>
          <div
            className={cx('note-list__list', 'list-group', { darkmode: this.props.ui.darkMode })}
          >
            {notesInCategory}
          </div>
        </div>
      )
    }

    renderNoteDetails() {
      let note = this.props.notes.find((n) => n.id === this.state.noteDetailId)
      if (!note) return null
      return (
        <ErrorBoundary>
          <NoteView
            key={`note-${note.id}`}
            noteId={note.id}
            editing={this.state.editingSelected}
            stopEditing={this.stopEditing}
            startEditing={this.startEditing}
          />
        </ErrorBoundary>
      )
    }

    renderSubNav() {
      const { filterIsEmpty, uiActions, ui } = this.props
      let popover = (
        <Popover id="filter">
          <FilterList
            filteredItems={this.state.filter}
            updateItems={this.updateFilter}
            renderBooks
          />
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={() => uiActions.setNoteFilter(null)} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {i18n('Notes are filtered')}
        </Alert>
      )

      let sortPopover = (
        <Popover id="sort">
          <SortList type={'notes'} />
        </Popover>
      )
      let sortGlyph = 'sort-by-attributes'
      if (ui.noteSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'

      if (filterIsEmpty) {
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
              <Button bsSize="small" onClick={() => this.setState({ attributesDialogOpen: true })}>
                <Glyphicon glyph="list" /> {i18n('Attributes')}
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
            <NavItem>
              <OverlayTrigger
                containerPadding={20}
                trigger="click"
                rootClose
                placement="bottom"
                overlay={sortPopover}
              >
                <Button bsSize="small">
                  <Glyphicon glyph={sortGlyph} /> {i18n('Sort')}
                </Button>
              </OverlayTrigger>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={() => this.setState({ categoriesDialogOpen: true })}>
                <Glyphicon glyph="list" /> {i18n('Categories')}
              </Button>
            </NavItem>
          </Nav>
        </SubNav>
      )
    }

    render() {
      return (
        <div className="note-list container-with-sub-nav">
          {this.renderSubNav()}
          {this.renderCustomAttributes()}
          {this.renderCategoriesModal()}
          <Grid fluid className="tab-body">
            <Row>
              <Col sm={3}>
                <h1 className={cx('secondary-text', { darkmode: this.props.ui.darkMode })}>
                  {i18n('Notes')}{' '}
                  <Button onClick={this.handleCreateNewNote}>
                    <Glyphicon glyph="plus" />
                  </Button>
                </h1>
                <div className="note-list__category-list">{this.renderNotes()}</div>
              </Col>
              <Col sm={9}>{this.renderNoteDetails()}</Col>
            </Row>
          </Grid>
        </div>
      )
    }
  }

  NoteListView.propTypes = {
    categories: PropTypes.array.isRequired,
    visibleNotesByCategory: PropTypes.object.isRequired,
    notes: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
  }

  const {
    redux,
    pltr: {
      actions,
      selectors: {
        sortedNoteCategoriesSelector,
        visibleSortedNotesByCategorySelector,
        noteFilterIsEmptySelector,
      },
    },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          notes: state.present.notes,
          characters: state.present.characters,
          places: state.present.places,
          tags: state.present.tags,
          ui: state.present.ui,
          categories: sortedNoteCategoriesSelector(state.present),
          visibleNotesByCategory: visibleSortedNotesByCategorySelector(state.present),
          filterIsEmpty: noteFilterIsEmptySelector(state.present),
          customAttributes: state.present.customAttributes.characters,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.note, dispatch),
          customAttributeActions: bindActionCreators(actions.customAttribute, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(NoteListView)
  }

  throw new Error('Could not connect NoteListView')
}

export default NoteListViewConnector