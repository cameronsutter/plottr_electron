import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'
import ItemsManagerModal, { ListItem } from 'components/dialogs/ItemsManagerModal'
import { actions, selectors } from 'pltr/v2'

const CustomAttributeActions = actions.customAttribute

const {
  placeCustomAttributesThatCanChangeSelector,
  characterCustomAttributesThatCanChangeSelector,
  cardsCustomAttributesThatCanChangeSelector,
} = selectors

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

function mapStateToProps(state, { type }) {
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
    default:
      canChangeFn = () => {
        console.warn(`${type}CustomAttributesThatCanChangeSelector not implemented`)
        return customAttributes.map(({ name }) => name)
      }
      break
  }

  return {
    customAttributes: state.present.customAttributes[type],
    customAttributesThatCanChange: canChangeFn(state.present),
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch, { type }) {
  const actions = bindActionCreators(CustomAttributeActions, dispatch)

  switch (type) {
    case 'characters':
      return {
        addAttribute: actions.addCharacterAttr,
        removeAttribute: actions.removeCharacterAttr,
        editAttribute: actions.editCharacterAttr,
        reorderAttribute: actions.reorderCharacterAttribute,
      }

    case 'places':
      return {
        addAttribute: actions.addPlaceAttr,
        removeAttribute: actions.removePlaceAttr,
        editAttribute: actions.editPlaceAttr,
        reorderAttribute: actions.reorderPlacesAttribute,
      }

    case 'scenes':
      return {
        addAttribute: actions.addCardAttr,
        removeAttribute: actions.removeCardAttr,
        editAttribute: actions.editCardAttr,
        reorderAttribute: actions.reorderCardsAttribute,
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

export default connect(mapStateToProps, mapDispatchToProps)(CustomAttributeModal)
