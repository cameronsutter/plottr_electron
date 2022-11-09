import React from 'react'
import PropTypes from 'react-proptypes'
import { upperCase } from 'lodash'

import { t as i18n } from 'plottr_locales'

import Form from '../Form'
import Modal from '../Modal'
import Button from '../Button'

const withoutDefault = (f) => {
  return (event) => {
    event.preventDefault()
    f(event)
  }
}

export default function DeleteConfirmModal(props) {
  const { name, customText, onDelete, onCancel, notSubmit, confirmText } = props
  return (
    <Modal show={true} dialogClassName="center-modal-vertically" animation={false}>
      <Modal.Body>
        <h6>
          {customText
            ? customText
            : i18n('Are you sure you want to delete { thing }?', { thing: name })}
        </h6>
      </Modal.Body>
      <Modal.Footer>
        <Form
          onSubmit={withoutDefault(notSubmit ? () => {} : onDelete)}
          onKeyDown={(event) => {
            if (event.which == 27) onCancel(event)
          }}
        >
          <Button onClick={onDelete} type="submit" autoFocus={!notSubmit} bsStyle="danger">
            {confirmText ? upperCase(confirmText) : i18n('DELETE')}
          </Button>
          <Button onClick={onCancel}>{i18n('Cancel')}</Button>
        </Form>
      </Modal.Footer>
    </Modal>
  )
}

DeleteConfirmModal.propTypes = {
  name: PropTypes.string,
  customText: PropTypes.string,
  onDelete: PropTypes.func,
  onCancel: PropTypes.func,
  notSubmit: PropTypes.bool,
  confirmText: PropTypes.string,
}
