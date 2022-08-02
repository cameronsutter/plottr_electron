import React from 'react'
import PropTypes from 'prop-types'

import { t as i18n } from 'plottr_locales'

import InputModal from './InputModal'
import { checkDependencies } from '../checkDependencies'

const NewProjectInputModalConnector = (connector) => {
  const {
    platform: {
      file: { createNew },
    },
  } = connector
  checkDependencies({ createNew })

  const NewProjectInputModal = ({ visible, actions, template }) => {
    const handleNameInput = (value) => {
      createNew(template, value)
      handleCloseModal()
    }

    const handleCloseModal = () => {
      actions.setShowNewProjectInputModal(false)
    }

    if (!visible) {
      return null
    }

    return (
      <InputModal
        title={i18n('Name Your Project:')}
        getValue={handleNameInput}
        isOpen={true}
        cancel={handleCloseModal}
        type="text"
      />
    )
  }

  NewProjectInputModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    actions: PropTypes.object,
    template: PropTypes.object,
  }

  const { redux } = connector

  if (redux) {
    const {
      pltr: { actions, selectors },
    } = connector
    const { connect, bindActionCreators } = redux
    checkDependencies({ redux, actions, selectors })

    return connect(
      (state) => ({
        visible: selectors.showNewProjectInputModalSelector(state.present),
      }),
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.project, dispatch),
        }
      }
    )(NewProjectInputModal)
  }

  throw new Error('Could not connect NewProjectInputModal')
}

export default NewProjectInputModalConnector
