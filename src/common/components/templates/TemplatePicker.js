import React, { Component, Fragment } from 'react'
import PropTypes from 'react-proptypes'
import { shell, remote, ipcRenderer } from 'electron'
import PlottrModal from 'components/PlottrModal'
import i18n from 'format-message'
import { ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import {
  listTemplates,
  listCustomTemplates,
  deleteTemplate,
  editTemplateDetails,
} from '../../utils/templates'
import CharacterTemplateDetails from './CharacterTemplateDetails'
import PlotlineTemplateDetails from './PlotlineTemplateDetails'
import ProjectTemplateDetails from './ProjectTemplateDetails'
import CardTemplateDetails from './CardTemplateDetails'
import cx from 'classnames'
import TemplateEdit from './TemplateEdit'
import { FaSave } from 'react-icons/fa'
import DeleteConfirmModal from '../../../app/components/dialogs/DeleteConfirmModal'
import getTestIds from 'test-utils/getTestIds'

export const testIds = getTestIds()

const modalStyles = { content: { width: '50%', marginLeft: '25%' } }
const win = remote.getCurrentWindow()

const typeMap = {
  project: i18n('Project Templates'),
  plotlines: i18n('Starter Templates'),
}

export default class TemplatePicker extends Component {
  state = {
    selectedId: null,
    selectedCategory: null,
    selectedType: null,
    editing: false,
    templates: [],
    customTemplates: [],
    deleting: false,
    deleteWhich: null,
  }

  static defaultProps = {
    showTemplateSaveButton: true,
    showCancelButton: true,
    confirmButtonText: i18n('Choose'),
    close: () => {},
  }

  componentDidMount() {
    let templates = {}
    let customTemplates = []
    this.props.type.forEach((type) => {
      templates[type] = listTemplates(type)
      customTemplates = [...customTemplates, ...listCustomTemplates(type)]
    })
    this.setState({ templates, customTemplates })
  }

  deleteTemplate = (e) => {
    e.stopPropagation()
    deleteTemplate(this.state.deleteWhich.id)
    this.setState({
      customTemplates: this.props.type.flatMap(listCustomTemplates),
      deleting: false,
      deleteWhich: null,
    })
  }

  cancelDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: false, deleteWhich: null })
  }

  handleDelete = (e, template) => {
    e.stopPropagation()
    this.setState({ deleting: true, deleteWhich: template })
  }

  startSaveAsTemplate = () => {
    ipcRenderer.sendTo(win.webContents.id, 'save-as-template-start', this.props.type) // sends this message to this same process
  }

  selectedTemplate = () => {
    const { templates, customTemplates, selectedId, selectedCategory, selectedType } = this.state
    if (selectedCategory == 'custom') {
      return customTemplates.find((template) => template.id == selectedId)
    }

    if (selectedCategory == 'starter') {
      return templates[selectedType].find((template) => template.id == selectedId)
    }
  }

  editTemplate = (e) => {
    e.stopPropagation()
    this.setState({ editing: true })
  }

  saveTemplateEdit = (data) => {
    editTemplateDetails(data.id, data)
    const customTemplates = this.props.type.flatMap((type) => listCustomTemplates(type))
    this.setState({ editing: false, customTemplates })
  }

  chooseTemplate = () => {
    if (!this.state.selectedId) return
    this.props.onChooseTemplate(this.selectedTemplate())
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.state.deleteWhich.name}
        onDelete={this.deleteTemplate}
        onCancel={this.cancelDelete}
      />
    )
  }

  renderLink(template) {
    if (!template.link) return null

    return (
      <a
        data-testid={testIds.link}
        className="template-picker__link"
        title={template.link}
        onClick={() => shell.openExternal(template.link)}
      >
        <Glyphicon glyph="info-sign" />
      </a>
    )
  }

  renderCustomButtons(category, selected, template) {
    if (category != 'custom') return null
    if (!selected) return null

    return (
      <div>
        <Button data-testid={testIds.edit} bsSize="small" onClick={(e) => this.editTemplate(e)}>
          <Glyphicon glyph="edit" />
        </Button>
        <Button
          data-testid={testIds.delete}
          bsSize="small"
          onClick={(e) => this.handleDelete(e, template)}
        >
          <Glyphicon glyph="trash" />
        </Button>
      </div>
    )
  }

  renderTemplateDetails() {
    if (!this.state.selectedId) return null

    const template = this.selectedTemplate()
    if (!template) return null

    let edit = null
    if (this.state.editing) {
      edit = (
        <TemplateEdit
          template={template}
          darkMode={this.props.darkMode}
          saveEdit={this.saveTemplateEdit}
          cancel={() => this.setState({ editing: false })}
        />
      )
    }

    let details = null
    switch (template.type) {
      case 'characters':
        details = <CharacterTemplateDetails template={template} />
        break
      case 'plotlines':
        details = <PlotlineTemplateDetails template={template} />
        break
      case 'project':
        details = <ProjectTemplateDetails template={template} />
        break
      case 'scenes':
        details = <CardTemplateDetails template={template} />
        break
    }

    return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <h3 data-testid={testIds[`name-${template.id}`]} className="panel-title">
            {template.name}
            {this.renderLink(template)}
          </h3>
          <p data-testid={testIds[`description-${template.id}`]}>{template.description}</p>
        </div>
        {edit}
        {details}
      </div>
    )
  }

  renderTemplateList(list, category, type) {
    // modal but not open
    if (this.props.modal && !this.props.isOpen) return null

    const { selectedId, selectedCategory } = this.state

    return list.map((template) => {
      let selected = selectedCategory == category && selectedId == template.id
      let klasses = cx('list-group-item', { selected })
      return (
        <li
          key={template.id}
          data-testid={testIds[`template-${template.id}`]}
          className={klasses}
          onClick={() =>
            this.setState({
              selectedId: template.id,
              selectedCategory: category,
              selectedType: type,
              editing: false,
            })
          }
        >
          <div>{template.name}</div>
          {this.renderCustomButtons(category, selected, template)}
        </li>
      )
    })
  }

  renderSaveButton(num) {
    if (!this.props.showTemplateSaveButton) return null
    if (num) return null
    if (
      this.props.type.length === 1 &&
      this.props.type[0] === 'characters' &&
      !this.props.canMakeCharacterTemplates
    )
      return null

    return (
      <Button data-testid={testIds.save} bsSize="small" onClick={this.startSaveAsTemplate}>
        <FaSave className="svg-save-template" /> {i18n('Save as Template')}
      </Button>
    )
  }

  renderStarterTemplates() {
    const listTypes = Object.keys(this.state.templates)
    return listTypes.map((type) => {
      const list = this.state.templates[type]
      const title = typeMap[type]
      return (
        <Fragment key={type}>
          <h1 className="">{title}</h1>
          <ul className="list-group">{this.renderTemplateList(list, 'starter', type)}</ul>
        </Fragment>
      )
    })
  }

  renderBody() {
    return (
      <div className="template-picker__dialog-wrapper">
        {this.renderDelete()}
        <div className="template-picker__wrapper">
          <div className="template-picker__list">
            <h1 className="">{i18n('My Templates')}</h1>
            <ul className="list-group">
              {this.renderSaveButton(this.state.customTemplates.length)}
              {this.renderTemplateList(this.state.customTemplates, 'custom')}
            </ul>
            {this.renderStarterTemplates()}
          </div>
          <div className="template-picker__details">{this.renderTemplateDetails()}</div>
        </div>
        <ButtonToolbar className="card-dialog__button-bar">
          {this.props.showCancelButton && (
            <Button data-testid={testIds.cancel} onClick={this.props.close}>
              {i18n('Cancel')}
            </Button>
          )}
          <Button
            data-testid={testIds.confirm}
            bsStyle="success"
            onClick={this.chooseTemplate}
            disabled={!this.state.selectedId}
          >
            {this.props.confirmButtonText}
          </Button>
        </ButtonToolbar>
      </div>
    )
  }

  render() {
    if (this.props.modal) {
      return (
        <PlottrModal
          isOpen={this.props.isOpen}
          onRequestClose={this.props.close}
          style={modalStyles}
        >
          {this.renderBody()}
        </PlottrModal>
      )
    } else {
      return this.renderBody()
    }
  }

  static propTypes = {
    modal: PropTypes.bool.isRequired,
    close: PropTypes.func,
    onChooseTemplate: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    type: PropTypes.array,
    darkMode: PropTypes.bool,
    canMakeCharacterTemplates: PropTypes.bool,
    showTemplateSaveButton: PropTypes.bool,
    showCancelButton: PropTypes.bool,
    confirmButtonText: PropTypes.string,
  }
}
