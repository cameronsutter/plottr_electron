import { ipcRenderer, remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Modal,
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

const win = remote.getCurrentWindow()

class TemplateCreate extends Component {
  saveEdit = () => {
    const data = {
      name: findDOMNode(this.refs.name).value,
      description: findDOMNode(this.refs.description).value,
      link: findDOMNode(this.refs.link).value,
    }

    ipcRenderer.sendTo(win.webContents.id, 'save-custom-template', { type: this.props.type, data })
    this.props.close()
  }

  titleFor = (type) => {
    switch (type) {
      case 'plotlines':
        return i18n('My Timeline Template')
      case 'characters':
        return i18n('My Character Template')
      case 'scenes':
        return i18n('My Scene Template')
    }
    // This was the old default at the time of refactoring
    return i18n('My Character Template')
  }

  renderToolBar() {
    return (
      <ButtonToolbar>
        <Button bsStyle="success" onClick={this.saveEdit}>
          {i18n('Save')}
        </Button>
        <Button onClick={this.props.close}>{i18n('Cancel')}</Button>
      </ButtonToolbar>
    )
  }

  renderBody() {
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Name')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" ref="name" defaultValue={i18n('Custom Template')} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Description')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" ref="description" defaultValue={''} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Source Link')}
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              ref="link"
              defaultValue={''}
              placeholder="https://example.com/"
            />
          </Col>
        </FormGroup>
      </Form>
    )
  }

  render() {
    const title = this.titleFor(this.props.type)

    return (
      <Modal
        show={true}
        onHide={this.props.close}
        dialogClassName={cx('book-dialog', { darkmode: this.props.ui.darkMode })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderBody()}</Modal.Body>
        <Modal.Footer>{this.renderToolBar()}</Modal.Footer>
      </Modal>
    )
  }

  static propTypes = {
    close: PropTypes.func.isRequired,
    type: PropTypes.string,
    ui: PropTypes.object.isRequired,
  }
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(TemplateCreate)
