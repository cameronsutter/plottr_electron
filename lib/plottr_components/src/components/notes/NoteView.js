import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import UnconnectedBookSelectList from '../project/BookSelectList'
import UnconnectedNoteEditDetails from './NoteEditDetails'
import UnconnectedNoteDetails from './NoteDetails'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedSelectList from '../SelectList'
import cx from 'classnames'

import { checkDependencies } from '../checkDependencies'

const NoteViewConnector = (connector) => {
  const BookSelectList = UnconnectedBookSelectList(connector)
  const SelectList = UnconnectedSelectList(connector)
  const NoteEditDetails = UnconnectedNoteEditDetails(connector)
  const NoteDetails = UnconnectedNoteDetails(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)

  class NoteView extends Component {
    renderBookSelectList() {
      const { actions, note } = this.props

      return (
        <BookSelectList
          selectedBooks={note.bookIds}
          parentId={note.id}
          add={actions.addBook}
          remove={actions.removeBook}
        />
      )
    }

    render() {
      const {
        editing,
        darkMode,
        note,
        characters,
        actions,
        places,
        tags,
        stopEditing,
        startEditing,
      } = this.props
      return (
        <div className={cx('note-list__note-view', { editing, darkmode: darkMode })}>
          <div className="note-list__note-view__left-side">
            {this.renderBookSelectList()}
            <SelectList
              parentId={note.id}
              type={'Characters'}
              selectedItems={note.characters}
              allItems={characters}
              add={actions.addCharacter}
              remove={actions.removeCharacter}
            />
            <SelectList
              parentId={note.id}
              type={'Places'}
              selectedItems={note.places}
              allItems={places}
              add={actions.addPlace}
              remove={actions.removePlace}
            />
            <SelectList
              parentId={note.id}
              type={'Tags'}
              selectedItems={note.tags}
              allItems={tags}
              add={actions.addTag}
              remove={actions.removeTag}
            />
          </div>
          <div className="note-list__note-view__right-side">
            <ErrorBoundary>
              {editing ? (
                <NoteEditDetails noteId={note.id} finishEditing={stopEditing} />
              ) : (
                <NoteDetails noteId={note.id} startEditing={startEditing} />
              )}
            </ErrorBoundary>
          </div>
        </div>
      )
    }
  }

  NoteView.propTypes = {
    noteId: PropTypes.number.isRequired,
    note: PropTypes.object.isRequired,
    editing: PropTypes.bool.isRequired,
    startEditing: PropTypes.func.isRequired,
    stopEditing: PropTypes.func.isRequired,
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    darkMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({
    redux,
    selectors,
    actions,
  })

  const NoteActions = actions.note

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          tags: selectors.sortedTagsSelector(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          note: selectors.singleNoteSelector(state.present, ownProps.noteId),
          characters: selectors.charactersSortedAtoZSelector(state.present),
          places: selectors.placesSortedAtoZSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(NoteActions, dispatch),
        }
      }
    )(NoteView)
  }

  throw new Error('Cannot connect NoteView')
}

export default NoteViewConnector
