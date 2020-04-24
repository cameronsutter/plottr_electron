import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { shell } from 'electron'
import Modal from 'react-modal'
import i18n from 'format-message'
import { ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import listTemplates from '../../utils/templates'
import CharacterTemplateDetails from './CharacterTemplateDetails'
import PlotlineTemplateDetails from './PlotlineTemplateDetails'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}

export default class TemplatePicker extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedId: null,
    }
    this.templates = listTemplates(props.type)
  }

  selectedTemplate = () => {
    return this.templates.find(template => template.id == this.state.selectedId)
  }

  chooseTemplate = () => {
    if (!this.state.selectedId) return
    this.props.onChooseTemplate(this.selectedTemplate())
  }

  renderLink (template) {
    if (!template.link) return null

    return <a className='template-picker__link' title={template.link} onClick={() => shell.openExternal(template.link)}><Glyphicon glyph='info-sign' /></a>
  }

  renderTemplateDetails () {
    if (!this.state.selectedId) return null

    const template = this.selectedTemplate()
    if (!template) return null

    let details = null
    switch (this.props.type) {
      case 'characters':
        details = <CharacterTemplateDetails template={template}/>
        break
      case 'plotlines':
        details = <PlotlineTemplateDetails template={template}/>
        break
    }

    return <div className='panel panel-primary'>
      <div className='panel-heading'>
        <h3 className='panel-title'>{template.name}{this.renderLink(template)}</h3>
        <p>{template.description}</p>
      </div>
      {details}
    </div>
  }

  renderTemplateList () {
    // modal but not open
    if (this.props.modal && !this.props.isOpen) return null

    return this.templates.map(template => {
      let klasses = 'list-group-item'
      if (template.id == this.state.selectedId) klasses += ' selected'
      return <li key={template.id} className={klasses} onClick={() => this.setState({selectedId: template.id})}>
        {template.name}
      </li>
    })
  }

  renderBody () {
    return <div className='template-picker__dialog-wrapper'>
      <div className='template-picker__wrapper'>
        <div className='template-picker__list'>
          <h1 className=''>{i18n('Templates')}</h1>
          <ul className='list-group'>
            {this.renderTemplateList()}
          </ul>
        </div>
        <div className='template-picker__details'>
          {this.renderTemplateDetails()}
        </div>
      </div>
      <ButtonToolbar className='card-dialog__button-bar'>
        <Button onClick={this.props.close}>
          {i18n('Cancel')}
        </Button>
        <Button bsStyle='success' onClick={this.chooseTemplate} disabled={!this.state.selectedId}>
          {i18n('Choose')}
        </Button>
      </ButtonToolbar>
    </div>
  }

  render () {
    if (this.props.modal) {
      if (this.props.darkMode) modalStyles.content.backgroundColor = '#666'
      return <Modal isOpen={this.props.isOpen} onRequestClose={this.props.close} style={modalStyles}>
        {this.renderBody()}
      </Modal>
    } else {
      return this.renderBody()
    }
  }

  static propTypes = {
    modal: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    onChooseTemplate: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    type: PropTypes.string,
    darkMode: PropTypes.bool,
  }
}