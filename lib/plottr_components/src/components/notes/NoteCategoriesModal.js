import React from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import UnconnectedItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'

import { checkDependencies } from '../checkDependencies'

const NoteCategoriesModalConnector = (connector) => {
  const ItemsManagerModal = UnconnectedItemsManagerModal(connector)

  function NoteCategoriesModal({
    categories,
    ui: { darkMode },
    closeDialog,
    addNoteCategory,
    deleteNoteCategory,
    updateNoteCategory,
    reorderNoteCategory,
    startSaveAsTemplate,
  }) {
    return (
      <ItemsManagerModal
        title={i18n('Note Categories')}
        subtitle={i18n('Choose what categories you want to put your notes into')}
        addLabel={i18n('Add category')}
        itemType={'notes'}
        items={categories}
        darkMode={darkMode}
        closeDialog={closeDialog}
        onAdd={addNoteCategory}
        renderItem={(item, index) => (
          <ListItem
            key={item.id}
            item={item}
            index={index}
            showType={false}
            canChageType={false}
            deleteItem={deleteNoteCategory}
            updateItem={updateNoteCategory}
            reorderItem={reorderNoteCategory}
          />
        )}
        startSaveAsTemplate={startSaveAsTemplate}
      />
    )
  }

  NoteCategoriesModal.propTypes = {
    categories: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    closeDialog: PropTypes.func.isRequired,
    addNoteCategory: PropTypes.func.isRequired,
    deleteNoteCategory: PropTypes.func.isRequired,
    updateNoteCategory: PropTypes.func.isRequired,
    reorderNoteCategory: PropTypes.func.isRequired,
    startSaveAsTemplate: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { actions },
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
          categories: state.present.categories.notes,
          ui: state.present.ui,
          startSaveAsTemplate,
        }
      },
      (dispatch) => {
        return {
          ...bindActionCreators(actions.category, dispatch),
        }
      }
    )(NoteCategoriesModal)
  }

  throw new Error('Cannot connect NoteCategoriesModal.js')
}

export default NoteCategoriesModalConnector
