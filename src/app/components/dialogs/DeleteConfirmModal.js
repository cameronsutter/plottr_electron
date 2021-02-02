import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Modal, Button, Form } from 'react-bootstrap'
import i18n from 'format-message'

export default function DeleteConfirmModal(props) {
  const { name, customText, onDelete, onCancel, notSubmit } = props
  return (
    <Modal show={true} dialogClassName="center-modal-vertically">
      <Modal.Body>
        <h6>
          {customText
            ? customText
            : i18n('Are you sure you want to delete { thing }?', { thing: name })}
        </h6>
      </Modal.Body>
      <Modal.Footer>
        <Form
          onSubmit={notSubmit ? () => {} : onDelete}
          onKeyDown={(event) => {
            if (event.which == 27) onCancel(event)
          }}
        >
          <Button onClick={onDelete} type="submit" autoFocus={!notSubmit} bsStyle="danger">
            {i18n('DELETE')}
          </Button>
          <Button onClick={onCancel}>{i18n('Cancel')}</Button>
        </Form>
      </Modal.Footer>
    </Modal>
  )
}
