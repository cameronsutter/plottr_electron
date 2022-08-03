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

  const NewProjectInputModal = ({ projectNamingModalIsVisible, actions, newProjectTemplate }) => {
    const handleNameInput = (value) => {
      createNew(newProjectTemplate, value)
      handleCloseModal()
    }

    const handleCloseModal = () => {
      actions.finishCreatingNewProject()
    }

    if (!projectNamingModalIsVisible) {
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
    projectNamingModalIsVisible: PropTypes.bool.isRequired,
    actions: PropTypes.object,
    newProjectTemplate: PropTypes.object,
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
        projectNamingModalIsVisible: selectors.projectNamingModalIsVisibleSelector(state.present),
        newProjectTemplate: selectors.newProjectTemplateSelector(state.present),
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
