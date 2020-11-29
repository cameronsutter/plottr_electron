import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Form, FormGroup, FormControl, Button, Modal, InputGroup, Col } from 'react-bootstrap'
import i18n from 'format-message'
import getTestIds from 'test-utils/getTestIds'

export const testIds = getTestIds();

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

  render () {
    return <Modal show={this.props.isOpen} onHide={this.props.cancel} dialogClassName='center-modal-vertically'>
      <Modal.Header closeButton>{this.props.title}</Modal.Header>
      <Modal.Body>
        <Form horizontal onSubmit={this.onSubmit}>
          <FormGroup>
            <Col sm={8}>
              <FormControl
                data-testid={testIds.input}
                type={this.props.type}
                autoFocus
                defaultValue=''
                onChange={this.handleChange}
              />
            </Col>
            <Col sm={1}>
            </Col>
            <Col sm={1} style={{marginRight: '4px'}}>
              <Button 
                data-testid={testIds.ok}
                bsStyle='primary'
                onClick={this.handleOK}
              >
                {i18n('OK')}
              </Button>
            </Col>
            <Col sm={1}>
              <Button data-testid={testIds.cancel} onClick={this.props.cancel}>{i18n('Cancel')}</Button>
            </Col>
          </FormGroup>
        </Form>
      </Modal.Body>
    </Modal>
  }

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    cancel: PropTypes.func.isRequired,
    getValue: PropTypes.func.isRequired,
    title: PropTypes.string,
  }
}
