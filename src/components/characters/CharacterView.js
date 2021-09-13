import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedCharacterEditDetails from './CharacterEditDetails'
import UnconnectedCharacterDetails from './CharacterDetails'
import UnconnectedSelectList from '../SelectList'
import UnconnectedBookSelectList from '../project/BookSelectList'
import { checkDependencies } from '../checkDependencies'

const CharacterViewConnector = (connector) => {
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const CharacterEditDetails = UnconnectedCharacterEditDetails(connector)
  const CharacterDetails = UnconnectedCharacterDetails(connector)
  const SelectList = UnconnectedSelectList(connector)
  const BookSelectList = UnconnectedBookSelectList(connector)

  class CharacterView extends Component {
    render() {
      const { character, tags, actions, ui, editing, stopEditing, startEditing, openAttributes } =
        this.props

      return (
        <div className={cx('character-list__character-view', { darkmode: ui.darkMode })}>
          <div className="character-list__character-view__left-side">
            <BookSelectList
              selectedBooks={character.bookIds}
              parentId={character.id}
              add={actions.addBook}
              remove={actions.removeBook}
            />
            <SelectList
              parentId={character.id}
              type={'Tags'}
              selectedItems={character.tags}
              allItems={tags}
              add={actions.addTag}
              remove={actions.removeTag}
            />
          </div>
          <div className="character-list__character-view__right-side">
            <ErrorBoundary>
              {editing ? (
                <CharacterEditDetails
                  characterId={character.id}
                  finishEditing={stopEditing}
                  openAttributes={openAttributes}
                />
              ) : (
                <CharacterDetails characterId={character.id} startEditing={startEditing} />
              )}
            </ErrorBoundary>
          </div>
        </div>
      )
    }

    static propTypes = {
      characterId: PropTypes.number.isRequired,
      editing: PropTypes.bool.isRequired,
      startEditing: PropTypes.func.isRequired,
      stopEditing: PropTypes.func.isRequired,
      openAttributes: PropTypes.func,
      character: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
      tags: PropTypes.array.isRequired,
      ui: PropTypes.object.isRequired,
    }
  }

  const {
    redux,
    pltr: {
      actions,
      selectors: { singleCharacterSelector, sortedTagsSelector },
    },
  } = connector
  checkDependencies({ redux, actions, singleCharacterSelector, sortedTagsSelector })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          character: singleCharacterSelector(state.present, ownProps.characterId),
          ui: state.present.ui,
          tags: sortedTagsSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.character, dispatch),
        }
      }
    )(CharacterView)
  }

  throw new Error('Could not connect CharacterView.js')
}

export default CharacterViewConnector

// renderAssociations () {
//   let cards = null
//   let notes = null
//   if (this.props.character.cards.length > 0) {
//     cards = this.renderCardAssociations()
//   }
//   if (this.props.character.noteIds.length > 0) {
//     notes = this.renderNoteAssociations()
//   }
//   if (cards && notes) {
//     return [cards, <span key='ampersand'> & </span>, notes]
//   } else {
//     return cards || notes
//   }
// }

// renderCardAssociations () {
//   if (!this.props.character.cards) return null
//   if (!this.props.character.cards.length) return null

//   let label = i18n('{count, plural, one {1 card} other {# cards}}', { count: this.props.character.cards.length })
//   let cardsAssoc = this.props.character.cards.reduce((arr, cId) => {
//     let card = this.props.cards.find(c => c.id == cId)
//     if (card) return arr.concat(card.title)
//     return arr
//   }, []).join(', ')
//   let tooltip = <Tooltip id='card-association-tooltip'>{cardsAssoc}</Tooltip>
//   return <OverlayTrigger placement='top' overlay={tooltip} key='card-association'>
//     <span>{label}</span>
//   </OverlayTrigger>
// }

// renderNoteAssociations () {
//   if (!this.props.character.noteIds) return null
//   if (!this.props.character.noteIds.length) return null

//   let label = i18n('{count, plural, one {1 note} other {# notes}}', { count: this.props.character.noteIds.length })
//   let noteAssoc = this.props.character.noteIds.reduce((arr, nId) => {
//     let note = this.props.notes.find(n => n.id == nId)
//     if (note) return arr.concat(note.title)
//     return arr
//   }, []).join(', ')
//   let tooltip = <Tooltip id='notes-association-tooltip'>{noteAssoc}</Tooltip>
//   return <OverlayTrigger placement='top' overlay={tooltip} key='note-association'>
//     <span>{label}</span>
//   </OverlayTrigger>
// }
