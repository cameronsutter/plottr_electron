import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import UnconnectedBookSelectList from '../project/BookSelectList'
import UnconnectedNoteEditDetails from './NoteEditDetails'
import UnconnectedNoteDetails from './NoteDetails'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedSelectList from '../SelectList'
import cx from 'classnames'

const NoteViewConnector = (connector) => {
  const BookSelectList = UnconnectedBookSelectList(connector)
  const SelectList = UnconnectedSelectList(connector)
  const NoteEditDetails = UnconnectedNoteEditDetails(connector)
  const NoteDetails = UnconnectedNoteDetails(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)

  class NoteView extends Component {
    renderBookSelectList() {
      const { note, actions } = this.props

      return (
        <BookSelectList
          // selectedBooks={note.bookIds}
          // parentId={note.id}
          add={actions.addBook}
          remove={actions.removeBook}
        />
      )
    }

    render() {
      const { editing, ui, note, characters, actions, places, tags, categories } = this.props
      console.log('note', note);
      console.log('categories', categories);
      console.log('this.props', this.props);
      return (
        <div className="note-list__note-wrapper">
          <div className={cx('note-list__note', { editing: editing, darkmode: ui.darkMode })}>
            <div className="note-list__body">
              <div className="note-list__left-side">
                {this.renderBookSelectList()}
                <SelectList
                  // parentId={note.id}
                  type={'Characters'}
                  // selectedItems={note.characters}
                  allItems={characters}
                  add={actions.addCharacter}
                  remove={actions.removeCharacter}
                />
                <SelectList
                  // parentId={note.id}
                  type={'Places'}
                  // selectedItems={note.places}
                  allItems={places}
                  add={actions.addPlace}
                  remove={actions.removePlace}
                />
                <SelectList
                  // parentId={note.id}
                  type={'Tags'}
                  // selectedItems={note.tags}
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
    ui: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: {
      selectors: {
        singleNoteSelector,
        sortedTagsSelector
      },
      actions,
    },
  } = connector

  const NoteActions = actions.note

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          tags: sortedTagsSelector(state.present),
          ui: state.present.ui,
          note: singleNoteSelector(state.present, ownProps.noteId)
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
