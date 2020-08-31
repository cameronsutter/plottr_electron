import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Modal, Button, Form } from 'react-bootstrap'
import i18n from 'format-message'

export default class DeleteConfirmModal extends Component {
  render () {
    const { name, customText, onDelete, onCancel, notSubmit } = this.props
    return <Modal show={true} dialogClassName='center-modal-vertically'>
      <Modal.Body>
        <h6>{customText ? customText : i18n('Are you sure you want to delete { thing }?', { thing: name })}</h6>
      </Modal.Body>
      <Modal.Footer>
        <Form onSubmit={notSubmit ? () => {} : onDelete} onKeyDown={(event) => {if (event.which == 27) onCancel(event)}}>
          <Button onClick={notSubmit && onDelete} type='submit' autoFocus bsStyle='danger'>{i18n('DELETE')}</Button>
          <Button onClick={onCancel}>{i18n('Cancel')}</Button>
        </Form>
      </Modal.Footer>
    </Modal>
  }

  static propTypes = {
    name: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    customText: PropTypes.string,
    notSubmit: PropTypes.bool,
  }
}
