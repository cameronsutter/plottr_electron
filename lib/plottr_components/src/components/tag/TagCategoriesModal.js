import React from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import UnconnectedItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'

const TagCategoriesModalConnector = (connector) => {
  const ItemsManagerModal = UnconnectedItemsManagerModal(connector)

  function TagCategoriesModal({
    categories,
    ui: { darkMode },
    closeDialog,
    addTagCategory,
    deleteTagCategory,
    updateTagCategory,
    reorderTagCategory,
  }) {
    return (
      <ItemsManagerModal
        title={i18n('Tag Categories')}
        subtitle={i18n('Choose what categories you want to put your tags into')}
        addLabel={i18n('Add category')}
        itemType={'tags'}
        items={categories}
        darkMode={darkMode}
        closeDialog={closeDialog}
        onAdd={addTagCategory}
        renderItem={(item, index) => (
          <ListItem
            key={item.id}
            item={item}
            index={index}
            showType={false}
            canChageType={false}
            deleteItem={deleteTagCategory}
            updateItem={updateTagCategory}
            reorderItem={reorderTagCategory}
          />
        )}
      />
    )
  }

  TagCategoriesModal.propTypes = {
    categories: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    closeDialog: PropTypes.func.isRequired,
    addTagCategory: PropTypes.func.isRequired,
    deleteTagCategory: PropTypes.func.isRequired,
    updateTagCategory: PropTypes.func.isRequired,
    reorderTagCategory: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { actions },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux
    return connect(
      (state) => {
        return {
          categories: state.present.categories.tags,
          ui: state.present.ui,
        }
      },
      (dispatch) => {
        return {
          ...bindActionCreators(actions.category, dispatch),
        }
      }
    )(TagCategoriesModal)
  }

  throw new Error('Cannot connect TagCategoriesModal.js')
}

export default TagCategoriesModalConnector
