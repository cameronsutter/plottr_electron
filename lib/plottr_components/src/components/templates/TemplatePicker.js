import React, { Component, Fragment } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import cx from 'classnames'
import { FaSave } from 'react-icons/fa'
import UnconnectedPlottrModal from '../PlottrModal'
import UnconnectedPlotlineTemplateDetails from './PlotlineTemplateDetails'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import CharacterTemplateDetails from './CharacterTemplateDetails'
import CardTemplateDetails from './CardTemplateDetails'
import ProjectTemplateDetails from './ProjectTemplateDetails'
import TemplateEdit from './TemplateEdit'
import getTestIds from '../getTestIds'
import { template } from 'pltr/v2'

export const testIds = getTestIds()

const { lineFromTemplate, projectFromTemplate } = template
const modalStyles = { content: { width: '50%', marginLeft: '25%' } }

const typeMap = {
  project: t('Project Templates'),
  plotlines: t('Starter Templates'),
  characters: t('Starter Templates'),
  scenes: t('Starter Templates'),
  general: t('General'),
  romance: t('Romance'),
  mystery: t('Mystery'),
  action: t('Action'),
  screenplay: t('Screenplay'),
}

const subCategories = ['romance', 'mystery', 'action', 'general', 'screenplay']

const TemplatePickerConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)
  const PlotlineTemplateDetails = UnconnectedPlotlineTemplateDetails(connector)

  const {
    platform: {
      appVersion,
      startSaveAsTemplate,
      openExternal,
      template: { listTemplates, listCustomTemplates, deleteTemplate, editTemplateDetails },
    },
  } = connector

  class TemplatePicker extends Component {
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
      confirmButtonText: t('Choose'),
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
      const selectedTemplate = this.selectedTemplate()
      const { type } = selectedTemplate
      if (type === 'project' || type === 'plotlines') {
        const migrator = this.props.newProject ? projectFromTemplate : lineFromTemplate
        migrator(selectedTemplate, appVersion, '', (error, template) => {
          if (error) {
            // Let the ErrorBoundary handle the error
            throw new Error(error)
          }
          this.props.onChooseTemplate(template)
        })
      } else {
        this.props.onChooseTemplate(selectedTemplate)
      }
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
          onClick={() => {
            openExternal(template.link)
          }}
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
        <Button
          data-testid={testIds.save}
          bsSize="small"
          onClick={() => {
            startSaveAsTemplate(this.props.type)
          }}
        >
          <FaSave className="svg-save-template" /> {t('Save as Template')}
        </Button>
      )
    }

    renderStarterTemplates() {
      const listTypes = Object.keys(this.state.templates)
      return listTypes.map((type) => {
        if (type == 'plotlines') {
          const subs = subCategories.map((cat) => {
            let list = this.state.templates[type].filter((t) => {
              return t.categories && t.categories.includes(cat)
            })
            let title = typeMap[cat]
            return this.renderListFragment(cat, title, list, cat, type, false)
          })
          return (
            <Fragment key={type}>
              <h1 className="margin-bottom">{typeMap[type]}</h1>
              {subs}
            </Fragment>
          )
        } else {
          let list = this.state.templates[type]
          let title = typeMap[type]
          return this.renderListFragment(type, title, list, 'starter', type)
        }
      })
    }

    renderListFragment(key, title, list, category, type, h1 = true) {
      let titleEl = <h1>{title}</h1>
      if (!h1) titleEl = <h2>{title}</h2>
      return (
        <Fragment key={key}>
          {titleEl}
          <ul className="list-group">{this.renderTemplateList(list, category, type)}</ul>
        </Fragment>
      )
    }

    renderBody() {
      return (
        <div className="template-picker__dialog-wrapper">
          {this.renderDelete()}
          <div className="template-picker__wrapper">
            <div className="template-picker__list">
              <h1>{t('My Templates')}</h1>
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
                {t('Cancel')}
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
      newProject: PropTypes.bool,
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

  return TemplatePicker
}

export default TemplatePickerConnector
