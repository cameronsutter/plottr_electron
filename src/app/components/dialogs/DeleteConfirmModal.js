import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Modal, Button, Form } from 'react-bootstrap'
import i18n from 'format-message'

export default class DeleteConfirmModal extends Component {
  render () {
    return <Modal show={true} dialogClassName='center-modal-vertically'>
      <Modal.Body>
        <h6>{i18n('Are you sure you want to delete { thing }?', { thing: this.props.name })}</h6>
      </Modal.Body>
      <Modal.Footer>
        <Form onSubmit={this.props.onDelete} onKeyDown={(event) => {if (event.which == 27) this.props.onCancel(event)}}>
          <Button type='submit' autoFocus bsStyle='danger'>{i18n('DELETE')}</Button>
          <Button onClick={this.props.onCancel}>{i18n('Cancel')}</Button>
        </Form>
      </Modal.Footer>
    </Modal>
  }

  static propTypes = {
    name: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }
}
