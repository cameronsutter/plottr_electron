import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { shell, remote } from 'electron'
import Modal from 'react-modal'
import i18n from 'format-message'
import { ButtonToolbar, Button, Glyphicon, Collapse } from 'react-bootstrap'
import { listTemplates, listCustomTemplates, deleteTemplate, editTemplateDetails } from '../../utils/templates'
import CharacterTemplateDetails from './CharacterTemplateDetails'
import PlotlineTemplateDetails from './PlotlineTemplateDetails'
import cx from 'classnames'
import TemplateEdit from './TemplateEdit'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}

export default class TemplatePicker extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedId: null,
      selectedType: null,
      editing: false,
      templates: listTemplates(props.type),
      customTemplates: listCustomTemplates(props.type),
    }
  }

  componentDidMount () {
    if (!this.state.templates.length) {
      this.setState({templates: listTemplates(this.props.type)})
    }
    if (!this.state.customTemplates.length) {
      this.setState({customTemplates: listCustomTemplates(this.props.type)})
    }
  }

  selectedTemplate = () => {
    if (this.state.selectedType == 'custom') {
      return this.state.customTemplates.find(template => template.id == this.state.selectedId)
    }

    if (this.state.selectedType == 'starter') {
      return this.state.templates.find(template => template.id == this.state.selectedId)
    }
  }

  deleteTemplate = (e, template) => {
    e.stopPropagation()

    if (confirm(i18n('Are you sure you want to delete {template}?', {template: template.name}))) {
      deleteTemplate(template.id)
      this.setState({customTemplates: listCustomTemplates(this.props.type)})
    }
  }

  editTemplate = (e) => {
    e.stopPropagation()
    this.setState({editing: true})
  }

  saveTemplateEdit = (data) => {
    editTemplateDetails(data.id, data)
    this.setState({editing: false, customTemplates: listCustomTemplates(this.props.type)})
  }

  chooseTemplate = () => {
    if (!this.state.selectedId) return
    this.props.onChooseTemplate(this.selectedTemplate())
  }

  renderLink (template) {
    if (!template.link) return null

    return <a className='template-picker__link' title={template.link} onClick={() => shell.openExternal(template.link)}><Glyphicon glyph='info-sign' /></a>
  }

  renderCustomButtons (type, selected, template) {
    if (type != 'custom') return null
    if (!selected) return null

    return <div>
      <Button bsSize='small' onClick={e => this.editTemplate(e)}><Glyphicon glyph='edit'/></Button>
      <Button bsSize='small' onClick={e => this.deleteTemplate(e, template)}><Glyphicon glyph='trash'/></Button>
    </div>
  }

  renderTemplateDetails () {
    if (!this.state.selectedId) return null

    const template = this.selectedTemplate()
    if (!template) return null

    let edit = null
    if (this.state.editing) {
      edit = <TemplateEdit template={template} darkMode={this.props.darkMode} saveEdit={this.saveTemplateEdit} cancel={() => this.setState({editing: false})}/>
    }

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
      {edit}
      {details}
    </div>
  }

  renderTemplateList (list, type) {
    // modal but not open
    if (this.props.modal && !this.props.isOpen) return null

    const { selectedId, selectedType } = this.state

    return list.map(template => {
      let selected = selectedType == type && selectedId == template.id
      let klasses = cx('list-group-item', {selected})
      return <li key={template.id} className={klasses} onClick={() => this.setState({selectedId: template.id, selectedType: type, editing: false})}>
        <div>{template.name}</div>
        { this.renderCustomButtons(type, selected, template) }
      </li>
    })
  }

  renderBody () {
    return <div className='template-picker__dialog-wrapper'>
      <div className='template-picker__wrapper'>
        <div className='template-picker__list'>
          <h1 className=''>{i18n('My Templates')}</h1>
          <ul className='list-group'>
            {this.renderTemplateList(this.state.customTemplates, 'custom')}
          </ul>
          <h1 className=''>{i18n('Starter Templates')}</h1>
          <ul className='list-group'>
            {this.renderTemplateList(this.state.templates, 'starter')}
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