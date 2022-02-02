import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon, Nav, NavItem, Button, Alert, Popover, Grid, Row, Col } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'
import UnconnectedOverlayTrigger from '../OverlayTrigger'
import UnconnectedNoteView from './NoteView'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedNoteItem from './NoteItem'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import UnconnectedNoteCategoriesModal from './NoteCategoriesModal'
import UnconnectedSortList from '../SortList'
import { newIds } from 'pltr/v2'
import { checkDependencies } from '../checkDependencies'

const { nextId } = newIds

const NoteListViewConnector = (connector) => {
  const SortList = UnconnectedSortList(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const NoteView = UnconnectedNoteView(connector)
  const NoteCategoriesModal = UnconnectedNoteCategoriesModal(connector)
  const SubNav = UnconnectedSubNav(connector)
  const NoteItem = UnconnectedNoteItem(connector)
  const CustomAttrFilterList = UnconnectedCustomAttrFilterList(connector)
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)
  const OverlayTrigger = UnconnectedOverlayTrigger(connector)

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
          <div className={cx('note-list__list', 'list-group', { darkmode: this.props.darkMode })}>
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
      const { filterIsEmpty, uiActions, noteSort } = this.props
      const popover = () => (
        <Popover id="filter">
          <CustomAttrFilterList type="notes" />
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={() => uiActions.setNoteFilter(null)} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {i18n('Notes are filtered')}
        </Alert>
      )

      if (filterIsEmpty) {
        filterDeclaration = <span></span>
      }

      const sortPopover = () => (
        <Popover id="sort">
          <SortList type={'notes'} />
        </Popover>
      )
      let sortGlyph = 'sort-by-attributes'
      if (noteSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'

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
              <Button bsSize="small" onClick={() => this.setState({ categoriesDialogOpen: true })}>
                <Glyphicon glyph="list" /> {i18n('Categories')}
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
                <h1 className={cx('secondary-text', { darkmode: this.props.darkMode })}>
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
    darkMode: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    noteSort: PropTypes.string.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({
    redux,
    actions,
    selectors,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          notes: state.present.notes,
          characters: state.present.characters,
          places: state.present.places,
          tags: state.present.tags,
          darkMode: selectors.isDarkModeSelector(state.present),
          categories: selectors.sortedNoteCategoriesSelector(state.present),
          visibleNotesByCategory: selectors.visibleSortedNotesByCategorySelector(state.present),
          filterIsEmpty: selectors.noteFilterIsEmptySelector(state.present),
          customAttributes: state.present.customAttributes.characters,
          noteSortSelector: selectors.noteSortSelector(state.present),
          noteSort: selectors.noteSortSelector(state.present),
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
