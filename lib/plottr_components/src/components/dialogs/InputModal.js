import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Form, FormGroup, FormControl, Modal } from 'react-bootstrap'

import { t as i18n } from 'plottr_locales'

import Button from '../Button'
import getTestIds from '../getTestIds'

export const testIds = getTestIds()

export default class InputModal extends Component {
  state = {
    inputValue: '',
  }

  handleOK = () => {
    this.props.getValue(this.state.inputValue)
  }

  handleChange = (e) => {
    this.setState({
      inputValue: e.target.value,
    })
  }

  onSubmit = (e) => {
    e.preventDefault()
    this.handleOK()
  }

  render() {
    const okText = this.props.customOkButtonText || i18n('OK')
    return (
      <Modal
        show={this.props.isOpen}
        onHide={this.props.cancel}
        dialogClassName="center-modal-vertically"
      >
        <Modal.Header closeButton>{this.props.title}</Modal.Header>
        <Modal.Body>
          <Form horizontal onSubmit={this.onSubmit}>
            <FormGroup>
              <div className="input-modal__body-wrapper">
                <FormControl
                  data-testid={testIds.input}
                  type={this.props.type}
                  autoFocus
                  defaultValue={this.props.defaultValue || ''}
                  onChange={this.handleChange}
                />
                <div className="input-modal__controls">
                  <div className="input-modal__controls__control">
                    <Button data-testid={testIds.ok} bsStyle="primary" onClick={this.handleOK}>
                      {okText}
                    </Button>
                  </div>
                  <div className="input-modal__controls__control">
                    <Button data-testid={testIds.cancel} onClick={this.props.cancel}>
                      {i18n('Cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            </FormGroup>
          </Form>
        </Modal.Body>
      </Modal>
    )
  }

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    cancel: PropTypes.func.isRequired,
    getValue: PropTypes.func.isRequired,
    title: PropTypes.string,
    defaultValue: PropTypes.any,
    customOkButtonText: PropTypes.string,
  }
}
