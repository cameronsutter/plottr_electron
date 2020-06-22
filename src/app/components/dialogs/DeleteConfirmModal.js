import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Modal, Button } from 'react-bootstrap'
import i18n from 'format-message'

export default class DeleteConfirmModal extends Component {
  render () {
    return <Modal show={true} dialogClassName='center-modal-vertically'>
      <Modal.Body>
        <h6>{i18n('Are you sure you want to delete { thing }?', { thing: this.props.name })}</h6>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={this.props.onDelete} bsStyle='danger'>{i18n('DELETE')}</Button>
        <Button onClick={this.props.onCancel}>{i18n('Cancel')}</Button>
      </Modal.Footer>
    </Modal>
  }

  static propTypes = {
    name: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }
}
