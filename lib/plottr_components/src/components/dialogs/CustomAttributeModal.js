import React from 'react'
import { PropTypes } from 'prop-types'
import { t } from 'plottr_locales'
import UnconnectedItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'

import { checkDependencies } from '../checkDependencies'

const CustomAttributeModalConnector = (connector) => {
  const ItemsManagerModal = UnconnectedItemsManagerModal(connector)

  const {
    platform: { log },
  } = connector

  checkDependencies({ log })

  function CustomAttributeModal({
    type,
    customAttributes,
    customAttributesThatCanChange,
    closeDialog,
    addAttribute,
    removeAttribute,
    editAttribute,
    reorderAttribute,
    hideSaveAsTemplate,
  }) {
    return (
      <ItemsManagerModal
        title={t('Custom Attributes for { type }', { type: t(type) })}
        subtitle={t('Choose what you want to track about your { type }', { type: t(type) })}
        addLabel={t('Add attribute')}
        itemType={type}
        items={customAttributes}
        closeDialog={closeDialog}
        showSaveAsTemplate={!hideSaveAsTemplate}
        onAdd={(name) => addAttribute({ name, type: 'text' })}
        renderItem={(attr, index) => (
          <ListItem
            key={attr.name}
            item={attr}
            index={index}
            canChangeType={customAttributesThatCanChange.includes(attr.name)}
            deleteItem={({ name, id }) => removeAttribute(name, id)}
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
    closeDialog: PropTypes.func.isRequired,
    addAttribute: PropTypes.func.isRequired,
    removeAttribute: PropTypes.func.isRequired,
    editAttribute: PropTypes.func.isRequired,
    reorderAttribute: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, { type }) => {
        const customAttributes = state.present.customAttributes[type]

        let canChangeFn
        switch (type) {
          case 'characters':
            canChangeFn = selectors.characterCustomAttributesThatCanChangeSelector
            break
          case 'places':
            canChangeFn = selectors.placeCustomAttributesThatCanChangeSelector
            break
          case 'scenes':
            canChangeFn = selectors.cardsCustomAttributesThatCanChangeSelector
            break
          case 'notes':
            canChangeFn = selectors.notesCustomAttributesThatCanChangeSelector
            break
          default:
            canChangeFn = () => {
              log.warn(`${type}CustomAttributesThatCanChangeSelector not implemented`)
              return customAttributes.map(({ name }) => name)
            }
            break
        }

        const attributesSelector = (() => {
          switch (type) {
            case 'characters': {
              return (state) => {
                return selectors.characterAttributesForCurrentBookSelector(state)
              }
            }
            default: {
              return (state) => state.customAttributes[type] || []
            }
          }
        })()

        return {
          customAttributes: attributesSelector(state.present),
          customAttributesThatCanChange: canChangeFn(state.present),
        }
      },
      (dispatch, { type }) => {
        const customAttributeActions = bindActionCreators(actions.customAttribute, dispatch)
        const characterActions = bindActionCreators(actions.character, dispatch)
        const attributesActions = bindActionCreators(actions.attributes, dispatch)

        switch (type) {
          case 'characters':
            return {
              addAttribute: (attribute) =>
                characterActions.createCharacterAttribute(attribute.type, attribute.name),
              // Other attributes are still keyed by name :/
              removeAttribute: (_name, id) => {
                attributesActions.deleteCharacterAttribute(id)
              },
              // An adaptor because the old interface for editing
              // attributes is super-janky.
              editAttribute: (index, oldAttribute, newAttribute) => {
                attributesActions.editCharacterAttributeMetadata(
                  oldAttribute.id,
                  newAttribute.name,
                  newAttribute.type,
                  oldAttribute.name
                )
              },
              reorderAttribute: attributesActions.reorderCharacterAttribute,
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
            log.warn(`${type} actions not implemented`)
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
