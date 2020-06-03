import { ipcRenderer, remote } from 'electron'
const win = remote.getCurrentWindow()
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Form, FormGroup, Col, ControlLabel, FormControl, ButtonToolbar, Button, Checkbox } from 'react-bootstrap'
import i18n from 'format-message'
import cx from 'classnames'

class TemplateEdit extends Component {
  state = {includeCharacter: true}

  saveEdit = () => {
    const plName = findDOMNode(this.refs.plName).value
    const plDescription = findDOMNode(this.refs.plDescription).value
    const plLink = findDOMNode(this.refs.plLink).value

    const plotline = {
      name: plName,
      description: plDescription,
      link: plLink,
    }

    let character = {}

    const includeCharacter = this.state.includeCharacter
    if (includeCharacter) {
      const chName = findDOMNode(this.refs.chName).value
      const chDescription = findDOMNode(this.refs.chDescription).value
      const chLink = findDOMNode(this.refs.chLink).value

      character = {
        name: chName,
        description: chDescription,
        link: chLink,
      }
    }

    ipcRenderer.send('save-as-template-finish', win.id, { plotline, includeCharacter, character })
    this.props.close()
  }

  toggleCharacter = () => {
    this.setState({includeCharacter: !this.state.includeCharacter})
  }

  renderCharacterTemplate () {
    if (!this.props.createCharacterToo) return null

    return <>
      <FormGroup>
        <Col sm={6}>
          <span className='lead'>{i18n('Character Template')}</span>
        </Col>
        <Col sm={6}>
          <Checkbox checked={this.state.includeCharacter} onChange={this.toggleCharacter} ref='characterToo'>
            {i18n('Save Character Template')}
          </Checkbox>
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Name')}
        </Col>
        <Col sm={8}>
          <FormControl disabled={!this.state.includeCharacter} type='text' ref='chName' defaultValue={i18n('Custom Template')} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Description')}
        </Col>
        <Col sm={8}>
          <FormControl disabled={!this.state.includeCharacter} type='text' ref='chDescription' defaultValue={''} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Link')}
        </Col>
        <Col sm={8}>
          <FormControl disabled={!this.state.includeCharacter} type='text' ref='chLink' defaultValue={''} />
        </Col>
      </FormGroup>
    </>
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
        <Col sm={12}>
          <span className='lead'>{i18n('Plotline Template')}</span>
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Name')}
        </Col>
        <Col sm={8}>
          <FormControl type='text' ref='plName' defaultValue={i18n('Custom Template')} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Description')}
        </Col>
        <Col sm={8}>
          <FormControl type='text' ref='plDescription' defaultValue={''} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Link')}
        </Col>
        <Col sm={8}>
          <FormControl type='text' ref='plLink' defaultValue={''} />
        </Col>
      </FormGroup>
      { this.renderCharacterTemplate() }
    </Form>
  }

  render () {
    return <Modal show={true} onHide={this.props.close} dialogClassName={cx('book-dialog', {darkmode: this.props.ui.darkMode})}>
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
    ui: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    createCharacterToo: !!state.customAttributes.characters.length,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TemplateEdit)

