import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import ItemsManagerModal, { ListItem } from 'components/dialogs/ItemsManagerModal'
import { actions } from 'pltr/v2'

const CategoryActions = actions.category

function CharacterCategoriesModal({
  categories,
  ui: { darkMode },
  closeDialog,
  addCharacterCategory,
  deleteCharacterCategory,
  updateCharacterCategory,
  reorderCharacterCategory,
}) {
  return (
    <ItemsManagerModal
      title={i18n('Character Categories')}
      subtitle={i18n('Choose what categories you want to put your characters into')}
      addLabel={i18n('Add category')}
      itemType={'characters'}
      items={categories}
      darkMode={darkMode}
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
    />
  )
}

CharacterCategoriesModal.propTypes = {
  categories: PropTypes.array,
  ui: PropTypes.object,
  closeDialog: PropTypes.func,
  addCharacterCategory: PropTypes.func,
  deleteCharacterCategory: PropTypes.func,
  updateCharacterCategory: PropTypes.func,
  reorderCharacterCategory: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    categories: state.present.categories.characters,
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(CategoryActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterCategoriesModal)
