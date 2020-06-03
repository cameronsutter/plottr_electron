import { ipcRenderer, remote } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Form, FormGroup, Col, ControlLabel, FormControl, ButtonToolbar, Button, Checkbox, Glyphicon, Collapse } from 'react-bootstrap'
import i18n from 'format-message'
import cx from 'classnames'

const win = remote.getCurrentWindow()

class TemplateEdit extends Component {
  constructor (props) {
    super(props)
    this.state = {
      includeCharacter: props.createCharacterToo,
      includePlotline: true,
      showDetails: false,
    }
  }

  saveEdit = () => {
    let plotline = {}
    let character = {}
    const includePlotline = this.state.includePlotline
    const includeCharacter = this.state.includeCharacter

    if (includePlotline) {
      const plName = findDOMNode(this.refs.plName).value
      const plDescription = findDOMNode(this.refs.plDescription).value
      const plLink = findDOMNode(this.refs.plLink).value

      plotline = {
        name: plName,
        description: plDescription,
        link: plLink,
      }
    }

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

    ipcRenderer.send('save-as-template-finish', win.id, { includePlotline, includeCharacter, plotline, character })
    this.props.close()
  }

  toggleCharacter = () => {
    this.setState({includeCharacter: !this.state.includeCharacter})
  }

  togglePlotline = () => {
    this.setState({includePlotline: !this.state.includePlotline})
  }

  renderCharacterTemplate () {
    if (!this.props.createCharacterToo) return null

    return <>
      <FormGroup>
        <Col sm={6}>
          <span className='lead'>{i18n('Character Template')}</span>
        </Col>
        <Col sm={6}>
          <Checkbox checked={this.state.includeCharacter} onChange={this.toggleCharacter}>
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
        <Col sm={6}>
          <span className='lead'>{i18n('Plotline Template')}</span>
        </Col>
        <Col sm={6}>
          <Checkbox checked={this.state.includePlotline} onChange={this.togglePlotline}>
            {i18n('Save Plotline Template')}
          </Checkbox>
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Name')}
        </Col>
        <Col sm={8}>
          <FormControl disabled={!this.state.includePlotline} type='text' ref='plName' defaultValue={i18n('Custom Template')} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Description')}
        </Col>
        <Col sm={8}>
          <FormControl disabled={!this.state.includePlotline} type='text' ref='plDescription' defaultValue={''} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={3}>
          {i18n('Link')}
        </Col>
        <Col sm={8}>
          <FormControl disabled={!this.state.includePlotline} type='text' ref='plLink' defaultValue={''} />
        </Col>
      </FormGroup>
      { this.renderCharacterTemplate() }
    </Form>
  }

  render () {
    return <Modal show={true} onHide={this.props.close} dialogClassName={cx('book-dialog', {darkmode: this.props.ui.darkMode})}>
      <Modal.Header closeButton>
        <Modal.Title>{i18n('Custom Template')}</Modal.Title>
        <p className='text-primary' style={{cursor: 'pointer'}} onClick={() => this.setState({showDetails: !this.state.showDetails})}>
          {i18n('What gets saved?')} <Glyphicon glyph={this.state.showDetails ? 'chevron-down' : 'chevron-right'}/>
        </p>
        <Collapse in={this.state.showDetails}>
          <ul>
            <li><p>{i18n('Plotline templates: the whole timeline just as you have it.')}</p></li>
            <li><p>{i18n('Character templates: custom attributes and their types.')}</p></li>
          </ul>
        </Collapse>
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
    ui: PropTypes.object.isRequired,
    createCharacterToo: PropTypes.bool.isRequired,
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

