import React from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import UnconnectedItemsManagerModal, { ListItem } from '../dialogs/ItemsManagerModal'

import { checkDependencies } from '../checkDependencies'

const PlaceCategoriesModalConnector = (connector) => {
  const ItemsManagerModal = UnconnectedItemsManagerModal(connector)

  function PlaceCategoriesModal({
    categories,
    closeDialog,
    addPlaceCategory,
    deletePlaceCategory,
    updatePlaceCategory,
    reorderPlaceCategory,
    startSaveAsTemplate,
  }) {
    return (
      <ItemsManagerModal
        title={i18n('Place Categories')}
        subtitle={i18n('Choose what categories you want to put your places into')}
        addLabel={i18n('Add category')}
        itemType={'places'}
        items={categories}
        closeDialog={closeDialog}
        onAdd={addPlaceCategory}
        renderItem={(item, index) => (
          <ListItem
            key={item.id}
            item={item}
            index={index}
            showType={false}
            canChageType={false}
            deleteItem={deletePlaceCategory}
            updateItem={updatePlaceCategory}
            reorderItem={reorderPlaceCategory}
          />
        )}
        startSaveAsTemplate={startSaveAsTemplate}
      />
    )
  }

  PlaceCategoriesModal.propTypes = {
    categories: PropTypes.array.isRequired,
    closeDialog: PropTypes.func.isRequired,
    addPlaceCategory: PropTypes.func.isRequired,
    deletePlaceCategory: PropTypes.func.isRequired,
    updatePlaceCategory: PropTypes.func.isRequired,
    reorderPlaceCategory: PropTypes.func.isRequired,
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
          categories: selectors.placeCategoriesSelector(state.present),
          startSaveAsTemplate,
        }
      },
      (dispatch) => {
        return {
          ...bindActionCreators(actions.category, dispatch),
        }
      }
    )(PlaceCategoriesModal)
  }

  throw new Error('Cannot connect PlaceCategoriesModal.js')
}

export default PlaceCategoriesModalConnector
