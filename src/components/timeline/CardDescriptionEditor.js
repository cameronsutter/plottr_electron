import React from 'react'
import { PropTypes } from 'prop-types'

import UnconnectedRichText from '../rce/RichText'

import { checkDependencies } from '../checkDependencies'

const areEqual = (prevProps, nextProps) => {
  return Object.keys(prevProps).reduce((acc, key) => {
    if (key === 'description' || key === 'selection') return acc
    return prevProps[key] === nextProps[key] && acc
  }, true)
}

const CardDescriptionEditorConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)

  const {
    pltr: { helpers, selectors },
  } = connector

  const CardDescriptionEditor = ({
    fileId,
    cardId,
    description,
    selection,
    darkMode,
    editCardAttributes,
  }) => {
    const editorPath = helpers.editors.cardDescriptionEditorPath(cardId)
    checkDependencies({ editorPath })

    const handleDescriptionChange = (newDescription, selection) => {
      editCardAttributes(
        cardId,
        newDescription ? { description: newDescription } : null,
        editorPath,
        selection
      )
    }

    return (
      <RichText
        id={`card.description-${cardId}`}
        fileId={fileId}
        description={description}
        selection={selection}
        onChange={handleDescriptionChange}
        editable
        darkMode={darkMode}
        autofocus
      />
    )
  }

  CardDescriptionEditor.propTypes = {
    cardId: PropTypes.number.isRequired,
    description: PropTypes.array.isRequired,
    selection: PropTypes.object.isRequired,
    editCardAttributes: PropTypes.func.isRequired,
    darkMode: PropTypes.bool.isRequired,
    fileId: PropTypes.string,
  }

  const {
    redux,
    pltr: { actions },
  } = connector
  checkDependencies({ redux, selectors, actions, helpers })

  if (redux) {
    const { connect } = redux

    return connect(
      (state, ownProps) => ({
        description: selectors.cardDescriptionByIdSelector(state.present, ownProps.cardId),
        selection: selectors.selectionSelector(
          state.present,
          helpers.editors.cardDescriptionEditorPath(ownProps.cardId)
        ),
        darkMode: selectors.isDarkModeSelector(state.present),
        fileId: selectors.selectedFileIdSelector(state.present),
      }),
      { editCardAttributes: actions.card.editCardAttributes }
    )(React.memo(CardDescriptionEditor, areEqual))
  }

  throw new Error('Could not connect CardDescriptionEditor')
}

export default CardDescriptionEditorConnector
