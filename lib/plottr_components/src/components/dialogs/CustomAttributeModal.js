import React from 'react'
import { PropTypes } from 'prop-types'
import { t as i18n } from 'plottr_locales'
import UnconnectedItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'

const CustomAttributeModalConnector = (connector) => {
  const ItemsManagerModal = UnconnectedItemsManagerModal(connector)

  function CustomAttributeModal({
    type,
    customAttributes,
    customAttributesThatCanChange,
    ui: { darkMode },
    closeDialog,
    addAttribute,
    removeAttribute,
    editAttribute,
    reorderAttribute,
    hideSaveAsTemplate,
  }) {
    return (
      <ItemsManagerModal
        title={i18n('Custom Attributes for { type }', { type })}
        subtitle={i18n('Choose what you want to track about your { type }', { type })}
        addLabel={i18n('Add attribute')}
        itemType={type}
        items={customAttributes}
        darkMode={darkMode}
        closeDialog={closeDialog}
        showSaveAsTemplate={!hideSaveAsTemplate}
        onAdd={(name) => addAttribute({ name, type: 'text' })}
        renderItem={(attr, index) => (
          <ListItem
            key={attr.name}
            item={attr}
            index={index}
            canChangeType={customAttributesThatCanChange.includes(attr.name)}
            deleteItem={({ name }) => removeAttribute(name)}
            updateItem={(newAttr) => editAttribute(index, attr, newAttr)}
            reorderItem={reorderAttribute}
          />
        )}
      />
    )
  }

  CustomAttributeModal.propTypes = {
    type: PropTypes.string.isRequired,
    hideSaveAsTemplate: PropTypes.bool,
    customAttributes: PropTypes.array.isRequired,
    customAttributesThatCanChange: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    closeDialog: PropTypes.func.isRequired,
    addAttribute: PropTypes.func.isRequired,
    removeAttribute: PropTypes.func.isRequired,
    editAttribute: PropTypes.func.isRequired,
    reorderAttribute: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: {
      actions,
      selectors: {
        characterCustomAttributesThatCanChangeSelector,
        placeCustomAttributesThatCanChangeSelector,
        cardsCustomAttributesThatCanChangeSelector,
        notesCustomAttributesThatCanChangeSelector,
      },
    },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, { type }) => {
        const customAttributes = state.present.customAttributes[type]

        let canChangeFn
        switch (type) {
          case 'characters':
            canChangeFn = characterCustomAttributesThatCanChangeSelector
            break
          case 'places':
            canChangeFn = placeCustomAttributesThatCanChangeSelector
            break
          case 'scenes':
            canChangeFn = cardsCustomAttributesThatCanChangeSelector
            break
          case 'notes':
            canChangeFn = notesCustomAttributesThatCanChangeSelector
            break
          default:
            canChangeFn = () => {
              console.warn(`${type}CustomAttributesThatCanChangeSelector not implemented`)
              return customAttributes.map(({ name }) => name)
            }
            break
        }

        return {
          customAttributes: state.present.customAttributes[type] || [],
          customAttributesThatCanChange: canChangeFn(state.present),
          ui: state.present.ui,
        }
      },
      (dispatch, { type }) => {
        const customAttributeActions = bindActionCreators(actions.customAttribute, dispatch)

        switch (type) {
          case 'characters':
            return {
              addAttribute: customAttributeActions.addCharacterAttr,
              removeAttribute: customAttributeActions.removeCharacterAttr,
              editAttribute: customAttributeActions.editCharacterAttr,
              reorderAttribute: customAttributeActions.reorderCharacterAttribute,
            }

          case 'places':
            return {
              addAttribute: customAttributeActions.addPlaceAttr,
              removeAttribute: customAttributeActions.removePlaceAttr,
              editAttribute: customAttributeActions.editPlaceAttr,
              reorderAttribute: customAttributeActions.reorderPlacesAttribute,
            }

          case 'scenes':
            return {
              addAttribute: customAttributeActions.addCardAttr,
              removeAttribute: customAttributeActions.removeCardAttr,
              editAttribute: customAttributeActions.editCardAttr,
              reorderAttribute: customAttributeActions.reorderCardsAttribute,
            }

          case 'notes':
            return {
              addAttribute: customAttributeActions.addNoteAttr,
              removeAttribute: customAttributeActions.removeNoteAttr,
              editAttribute: customAttributeActions.editNoteAttr,
              reorderAttribute: customAttributeActions.reorderNotesAttribute,
            }

          default:
            console.warn(`${type} actions not implemented`)
            return {
              addAttribute: () => {},
              removeAttribute: () => {},
              editAttribute: () => {},
              reorderAttribute: () => {},
            }
        }
      }
    )(CustomAttributeModal)
  }

  throw new Error('Could not connect CustomAttributeModal.js')
}

export default CustomAttributeModalConnector
