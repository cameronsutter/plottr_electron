import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Nav, NavItem, Alert, Popover, Grid } from 'react-bootstrap'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr/v2'

import Glyphicon from '../Glyphicon'
import Col from '../Col'
import Row from '../Row'
import FormControl from '../FormControl'
import Button from '../Button'
import UnconnectedOverlayTrigger from '../OverlayTrigger'
import UnconnectedNoteView from './NoteView'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedNoteItem from './NoteItem'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import UnconnectedNoteCategoriesModal from './NoteCategoriesModal'
import UnconnectedSortList from '../SortList'
import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'

const { nextId } = newIds

const detailID = (notesByCategory, notes, categories, noteDetailId) => {
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

  const NoteListView = ({
    categories,
    visibleNotesByCategory,
    notes,
    actions,
    characters,
    places,
    tags,
    darkMode,
    uiActions,
    filterIsEmpty,
    noteSort,
    notesSearchTerm,
  }) => {
    const [noteDetailId, setNoteDetailId] = useState(null)
    const [editingSelected, setEditingSelected] = useState(false)
    const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false)
    const [attributesDialogOpen, setAttributesDialogOpen] = useState(false)

    useEffect(() => {
      setNoteDetailId(detailID(visibleNotesByCategory, notes, categories, noteDetailId))
    }, [notes, visibleNotesByCategory, categories])

    const handleCreateNewNote = () => {
      const id = nextId(notes)
      actions.addNote()
      setNoteDetailId(id)
      setEditingSelected(true)
    }

    const startEditing = () => {
      setEditingSelected(true)
    }

    const stopEditing = () => {
      setEditingSelected(false)
    }

    const closeDialog = () => {
      setAttributesDialogOpen(false)
      setCategoriesDialogOpen(false)
    }

    const renderCustomAttributes = () => {
      if (!attributesDialogOpen) return null

      return <CustomAttributeModal type="notes" closeDialog={closeDialog} hideSaveAsTemplate />
    }

    const renderCategoriesModal = () => {
      if (!categoriesDialogOpen) return null
      return <NoteCategoriesModal closeDialog={closeDialog} />
    }

    const renderVisibleNotes = (categoryId) => {
      if (!visibleNotesByCategory[categoryId]) return []

      return visibleNotesByCategory[categoryId].map((n) => (
        <NoteItem
          key={n.id}
          note={n}
          selected={n.id == noteDetailId}
          startEdit={startEditing}
          stopEdit={stopEditing}
          select={() => setNoteDetailId(n.id)}
        />
      ))
    }

    const renderNotes = () => {
      return [...categories, { id: null, name: i18n('Uncategorized') }].map((cat) =>
        renderCategory(cat)
      )
    }

    const renderCategory = (category) => {
      const notesInCategory = renderVisibleNotes(category.id)
      if (!notesInCategory.length) return null
      return (
        <div key={`category-${category.id}`}>
          <h2 className="note-list__category-title">{category.name}</h2>
          <div className={cx('note-list__list', 'list-group', { darkmode: darkMode })}>
            {notesInCategory}
          </div>
        </div>
      )
    }

    const renderNoteDetails = () => {
      let note = notes.find((n) => n.id === noteDetailId)
      if (!note) return null
      return (
        <ErrorBoundary>
          <NoteView
            key={`note-${note.id}`}
            noteId={note.id}
            editing={editingSelected}
            stopEditing={stopEditing}
            startEditing={startEditing}
          />
        </ErrorBoundary>
      )
    }

    const insertSpace = (event) => {
      const currentValue = event.target.value
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      if (event.key === ' ') {
        uiActions.setNotesSearchTerm(
          currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1)
        )
      }
      event.preventDefault()
      event.stopPropagation()
    }

    const renderSubNav = () => {
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
              <Button bsSize="small" onClick={handleCreateNewNote}>
                <Glyphicon glyph="plus" /> {i18n('New')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={() => setAttributesDialogOpen(true)}>
                <Glyphicon glyph="list" /> {i18n('Attributes')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={() => setCategoriesDialogOpen(true)}>
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
            <NavItem>
              <FormControl
                onChange={withEventTargetValue(uiActions.setNotesSearchTerm)}
                onKeyUp={insertSpace}
                value={notesSearchTerm}
                type="text"
                placeholder="Search"
                className="toolbar__search"
              />
            </NavItem>
          </Nav>
        </SubNav>
      )
    }

    return (
      <div className="note-list container-with-sub-nav">
        {renderSubNav()}
        {renderCustomAttributes()}
        {renderCategoriesModal()}
        <Grid fluid className="tab-body">
          <Row>
            <Col sm={3}>
              <h1 className={cx('secondary-text', { darkmode: darkMode })}>
                {i18n('Notes')}{' '}
                <Button onClick={handleCreateNewNote}>
                  <Glyphicon glyph="plus" />
                </Button>
              </h1>
              <div className="note-list__category-list">{renderNotes()}</div>
            </Col>
            <Col sm={9}>{renderNoteDetails()}</Col>
          </Row>
        </Grid>
      </div>
    )
  }

  NoteListView.propTypes = {
    categories: PropTypes.array.isRequired,
    visibleNotesByCategory: PropTypes.object.isRequired,
    notes: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    darkMode: PropTypes.bool,
    uiActions: PropTypes.object.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    noteSort: PropTypes.string.isRequired,
    notesSearchTerm: PropTypes.string,
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
          visibleNotesByCategory: selectors.visibleSortedSearchedNotesByCategorySelector(
            state.present
          ),
          filterIsEmpty: selectors.noteFilterIsEmptySelector(state.present),
          customAttributes: state.present.customAttributes.characters,
          noteSortSelector: selectors.noteSortSelector(state.present),
          noteSort: selectors.noteSortSelector(state.present),
          notesSearchTerm: selectors.notesSearchTermSelector(state.present),
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
