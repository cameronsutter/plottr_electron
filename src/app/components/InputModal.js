import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { Form, FormGroup, FormControl, Button, Modal, InputGroup, Col } from 'react-bootstrap'
import i18n from 'format-message'

export default class InputModal extends Component {
  handleOK = () => {
    this.props.getValue(ReactDOM.findDOMNode(this.refs.input).value)
  }

  handleChange = () => {

  }

  render () {
    return <Modal show={this.props.isOpen} onHide={this.props.cancel}>
      <Modal.Header closeButton>{this.props.title}</Modal.Header>
      <Modal.Body>
        <Form horizontal>
          <FormGroup>
            <Col sm={8}>
              <FormControl type={this.props.type} ref='input' autoFocus defaultValue='' onChange={this.handleChange} onKeyDown={this.handleChange}/>
            </Col>
            <Col sm={1}>
            </Col>
            <Col sm={1} style={{marginRight: '4px'}}>
              <Button bsStyle='primary' onClick={this.handleOK}>{i18n('OK')}</Button>
            </Col>
            <Col sm={1}>
              <Button onClick={this.props.cancel}>{i18n('Cancel')}</Button>
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