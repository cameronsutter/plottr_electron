import React from 'react'
import { PropTypes } from 'prop-types'

import UnconnectedRichText from '../rce/RichText'

const CardDescriptionEditorConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)

  const CardDescriptionEditor = ({
    cardId,
    description,
    selection,
    darkMode,
    editCardAttributes,
  }) => {
    const {
      pltr: { helpers },
    } = connector

    const editorPath = helpers.editors.cardDescriptionEditorPath(cardId)

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
  }

  const {
    redux,
    pltr: { selectors, actions, helpers },
  } = connector

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
      }),
      {
        editCardAttributes: actions.card.editCardAttributes,
      }
    )(CardDescriptionEditor)
  }

  throw new Error('Could not connect CardDescriptionEditor')
}

export default CardDescriptionEditorConnector
