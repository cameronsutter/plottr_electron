import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import {
  Form,
  FormGroup,
  Col,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Button,
} from 'react-bootstrap'
import i18n from 'format-message'
import cx from 'classnames'

export default class TemplateEdit extends Component {
  saveEdit = () => {
    const data = {
      id: this.props.template.id,
      name: findDOMNode(this.refs.name).value,
      description: findDOMNode(this.refs.description).value,
      link: findDOMNode(this.refs.link).value,
    }

    this.props.saveEdit(data)
  }

  renderToolBar() {
    return (
      <ButtonToolbar>
        <Button bsStyle="success" onClick={this.saveEdit}>
          {i18n('Save')}
        </Button>
        <Button onClick={this.props.cancel}>{i18n('Cancel')}</Button>
      </ButtonToolbar>
    )
  }

  render() {
    const { template } = this.props
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            {i18n('Name')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" ref="name" defaultValue={template.name} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            {i18n('Description')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" ref="description" defaultValue={template.description} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            {i18n('Source Link')}
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              ref="link"
              defaultValue={template.link}
              placeholder="https://example.com/"
            />
          </Col>
        </FormGroup>
        {this.renderToolBar()}
      </Form>
    )
  }

  static propTypes = {
    template: PropTypes.object.isRequired,
    cancel: PropTypes.func.isRequired,
    saveEdit: PropTypes.func.isRequired,
    darkMode: PropTypes.bool,
  }
}
