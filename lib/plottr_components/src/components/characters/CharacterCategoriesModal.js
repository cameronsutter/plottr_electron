import React from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import UnconnectedItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'

import { checkDependencies } from '../checkDependencies'

const CharacterCategoriesModalConnector = (connector) => {
  const ItemsManagerModal = UnconnectedItemsManagerModal(connector)

  function CharacterCategoriesModal({
    categories,
    closeDialog,
    addCharacterCategory,
    deleteCharacterCategory,
    updateCharacterCategory,
    reorderCharacterCategory,
    startSaveAsTemplate,
  }) {
    return (
      <ItemsManagerModal
        title={i18n('Character Categories')}
        subtitle={i18n('Choose what categories you want to put your characters into')}
        addLabel={i18n('Add category')}
        itemType={'characters'}
        items={categories}
        closeDialog={closeDialog}
        onAdd={addCharacterCategory}
        renderItem={(item, index) => (
          <ListItem
            key={item.id}
            item={item}
            index={index}
            showType={false}
            canChageType={false}
            deleteItem={deleteCharacterCategory}
            updateItem={updateCharacterCategory}
            reorderItem={reorderCharacterCategory}
          />
        )}
        startSaveAsTemplate={startSaveAsTemplate}
      />
    )
  }

  CharacterCategoriesModal.propTypes = {
    categories: PropTypes.array.isRequired,
    closeDialog: PropTypes.func.isRequired,
    addCharacterCategory: PropTypes.func.isRequired,
    deleteCharacterCategory: PropTypes.func.isRequired,
    updateCharacterCategory: PropTypes.func.isRequired,
    reorderCharacterCategory: PropTypes.func.isRequired,
    startSaveAsTemplate: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
    platform: {
      template: { startSaveAsTemplate },
    },
  } = connector

  checkDependencies({ redux, actions, startSaveAsTemplate })

  if (redux) {
    const { connect, bindActionCreators } = redux
    return connect(
      (state) => {
        return {
          categories: selectors.characterCategoriesSelector(state.present),
          startSaveAsTemplate,
        }
      },
      (dispatch) => {
        return {
          ...bindActionCreators(actions.category, dispatch),
        }
      }
    )(CharacterCategoriesModal)
  }

  throw new Error('Cannot connect CharacterCategoriesModal.js')
}

export default CharacterCategoriesModalConnector
