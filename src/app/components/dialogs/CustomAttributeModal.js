import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as CustomAttributeActions from 'actions/customAttributes'
import i18n from 'format-message'
import {
  placeCustomAttributesThatCanChangeSelector,
  characterCustomAttributesThatCanChangeSelector,
  scenesCustomAttributesThatCanChangeSelector
} from '../../selectors/customAttributes'
import ItemsManagerModal, { ListItem } from 'components/dialogs/ItemsManagerModal';

function CustomAttributeModal({
  type,
  customAttributes,
  customAttributesThatCanChange,
  ui: {
    darkMode,
  },
  closeDialog,
  addAttribute,
  removeAttribute,
  editAttribute,
  reorderAttribute,
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
      showSaveAsTemplate
      onAdd={(name) => addAttribute({ name, type: 'text'})}
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

function mapStateToProps (state, { type }) {
  const customAttributes = state.present.customAttributes[type];

  let canChangeFn;
  switch (type) {
    case 'characters':
      canChangeFn = characterCustomAttributesThatCanChangeSelector
      break
    case 'places':
      canChangeFn = placeCustomAttributesThatCanChangeSelector
      break
    case 'scenes':
      canChangeFn = scenesCustomAttributesThatCanChangeSelector
      break
    default:
      canChangeFn = () => {
        console.warn(`${type}CustomAttributesThatCanChangeSelector not implemented`);
        return customAttributes.map(({ name }) => name);
      };
      break;
  }


  return {
    customAttributes: state.present.customAttributes[type],
    customAttributesThatCanChange: canChangeFn(state.present),
    ui: state.present.ui,
  }
}

function mapDispatchToProps (dispatch, { type }) {
  const actions = bindActionCreators(CustomAttributeActions, dispatch);

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
        addAttribute: actions.addSceneAttr,
        removeAttribute: actions.removeSceneAttr,
        editAttribute: actions.editSceneAttr,
        reorderAttribute: actions.reorderSceneAttribute,
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
  return {
    ...bindActionCreators(CustomAttributeActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomAttributeModal)
