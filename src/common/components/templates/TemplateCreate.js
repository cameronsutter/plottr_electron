import { ipcRenderer, remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Form, FormGroup, Col, ControlLabel, FormControl, ButtonToolbar, Button } from 'react-bootstrap'
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

    ipcRenderer.sendTo(win.webContents.id, 'pls-save-custom-template', { type: this.props.type, data })
    this.props.close()
  }

  renderToolBar () {
    return <ButtonToolbar>
      <Button bsStyle='success' onClick={this.saveEdit}>{i18n('Save')}</Button>
      <Button onClick={this.props.close}>{i18n('Cancel')}</Button>
    </ButtonToolbar>
  }

  renderBody () {
    return <Form horizontal>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Name')}
        </Col>
        <Col sm={8}>
          <FormControl type='text' ref='name' defaultValue={i18n('Custom Template')} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Description')}
        </Col>
        <Col sm={8}>
          <FormControl type='text' ref='description' defaultValue={''} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Source Link')}
        </Col>
        <Col sm={8}>
          <FormControl type='text' ref='link' defaultValue={''} placeholder='https://example.com/' />
        </Col>
      </FormGroup>
    </Form>
  }

  render () {
    let title = this.props.type == 'plotlines' ? i18n('My Timeline Template') : i18n('My Character Template')

    return <Modal show={true} onHide={this.props.close} dialogClassName={cx('book-dialog', {darkmode: this.props.ui.darkMode})}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { this.renderBody() }
      </Modal.Body>
      <Modal.Footer>
        { this.renderToolBar() }
      </Modal.Footer>
    </Modal>
  }

  static propTypes = {
    close: PropTypes.func.isRequired,
    type: PropTypes.string,
    ui: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.present.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TemplateCreate)

