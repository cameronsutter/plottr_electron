import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import Modal from 'react-modal'
import i18n from 'format-message'
import { ButtonToolbar, Button } from 'react-bootstrap'
import listTemplates from '../utils/templates'

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

  renderTemplateDetails () {
    if (!this.state.selectedId) return null

    const template = this.selectedTemplate()
    if (!template) return null

    const attrs = template.attributes.map(attr => {
      return <tr key={attr.name}>
        <td>{attr.name}</td>
        <td>{attr.type}</td>
      </tr>
    })

    return <div className='panel panel-primary'>
      <div className='panel-heading'>
        <h3 className='panel-title'>{template.name}</h3>
        <p>{template.description}</p>
      </div>
      <div className='panel-body'>
        <h5 className='text-center'>{i18n('Attributes')}</h5>
        <table className='table table-striped'>
          <thead>
            <tr><th>{i18n('Name')}</th><th>{i18n('Type')}</th></tr>
          </thead>
          <tbody>{attrs}</tbody>
        </table>
      </div>
    </div>
  }

  renderTemplateList () {
    if (!this.props.isOpen) return null
    return this.templates.map(template => {
      let klasses = 'list-group-item'
      if (template.id == this.state.selectedId) klasses += ' selected'
      return <li key={template.id} className={klasses} onClick={() => this.setState({selectedId: template.id})}>
        {template.name}
      </li>
    })
  }

  render () {
    if (this.props.darkMode) modalStyles.content.backgroundColor = '#888'
    return <Modal isOpen={this.props.isOpen} onRequestClose={this.props.close} style={modalStyles}>
      <div className='template-picker__dialog-wrapper'>
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
          <Button bsStyle='primary' onClick={this.chooseTemplate} disabled={!this.state.selectedId}>
            {i18n('Choose')}
          </Button>
        </ButtonToolbar>
      </div>
    </Modal>
  }

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    onChooseTemplate: PropTypes.func.isRequired,
    type: PropTypes.string,
    darkMode: PropTypes.bool,
  }
}