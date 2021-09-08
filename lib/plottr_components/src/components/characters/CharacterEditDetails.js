import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import {
  ButtonToolbar,
  Button,
  FormControl,
  FormGroup,
  ControlLabel,
  Tabs,
  Tab,
  Glyphicon,
} from 'react-bootstrap'
import { t } from 'plottr_locales'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedCategoryPicker from '../CategoryPicker'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedImage from '../images/Image'
import UnconnectedEditAttribute from '../EditAttribute'
import TemplatePickerConnector from '../templates/TemplatePicker'
import { checkDependencies } from '../checkDependencies'

const CharacterEditDetailsConnector = (connector) => {
  const CategoryPicker = UnconnectedCategoryPicker(connector)
  const RichText = UnconnectedRichText(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const Image = UnconnectedImage(connector)
  const EditAttribute = UnconnectedEditAttribute(connector)
  const TemplatePicker = TemplatePickerConnector(connector)

  const {
    platform: {
      templatesDisabled,
      openExternal,
      template: { getTemplateById },
    },
    pltr: { helpers },
  } = connector

  checkDependencies({
    templatesDisabled,
    openExternal,
    getTemplateById,
  })

  class CharacterEditDetails extends Component {
    constructor(props) {
      super(props)
      this.state = {
        categoryId: props.character.categoryId || null,
        newImageId: null,
        deleting: false,
        removing: false,
        removeWhichTemplate: null,
        activeTab: 1,
      }

      this.nameInputRef = null
      this.descriptionInputRef = null
    }

    componentWillUnmount() {
      this.saveEdit(false)
    }

    deleteCharacter = (e) => {
      e.stopPropagation()
      this.props.actions.deleteCharacter(this.props.character.id)
    }

    cancelDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: false })
    }

    handleDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: true })
    }

    beginRemoveTemplate = (templateId) => {
      this.setState({ removing: true, removeWhichTemplate: templateId })
    }

    finishRemoveTemplate = (e) => {
      e.stopPropagation()
      const { actions, character } = this.props
      const { removeWhichTemplate, activeTab } = this.state
      actions.removeTemplateFromCharacter(character.id, removeWhichTemplate)
      this.setState({
        removing: false,
        removeWhichTemplate: null,
        activeTab: activeTab - 1,
      })
    }

    cancelRemoveTemplate = (e) => {
      e.stopPropagation()
      this.setState({ removing: false, removeWhichTemplate: null })
    }

    handleEnter = (event) => {
      if (event.which === 13) {
        this.saveEdit()
      }
    }

    handleEsc = (event) => {
      if (event.which === 27) {
        this.saveEdit()
      }
    }

    handleChooseTemplate = (templateData) => {
      const { actions, character } = this.props
      actions.addTemplateToCharacter(character.id, templateData)
      const numTemplates = character.templates.length
      this.setState({
        showTemplatePicker: false,
        activeTab: numTemplates + 3,
      })
    }

    handleNotesChanged = (value) => {
      this.props.actions.editCharacter(this.props.character.id, {
        notes: value,
      })
    }

    handleAttrChange = (attrName) => (desc, selection) => {
      const editorPath = helpers.editors.characterCustomAttributeEditorPath(
        this.props.character.id,
        attrName
      )
      this.props.actions.editCharacter(
        this.props.character.id,
        helpers.editors.attrIfPresent(attrName, desc),
        editorPath,
        selection
      )
    }

    handleTemplateAttrChange = (id, name) => (desc, selection) => {
      const editorPath = helpers.editors.characterTemplateAttributeEditorPath(
        this.props.character.id,
        id,
        name
      )

      if (!desc) {
        this.props.actions.editCharacter(this.props.character.id, {}, editorPath, selection)
        return
      }
      this.props.actions.editCharacterTemplateAttribute(
        this.props.character.id,
        id,
        name,
        desc,
        editorPath,
        selection
      )
    }

    saveEdit = (close = true) => {
      var name = this.nameInputRef.value || this.props.character.name
      var description = this.descriptionInputRef.value
      var attrs = {}
      if (this.state.newImageId) {
        attrs.imageId = this.state.newImageId == -1 ? null : this.state.newImageId
      }
      this.props.actions.editCharacter(this.props.character.id, {
        name,
        description,
        categoryId: this.state.categoryId == -1 ? null : this.state.categoryId,
        ...attrs,
      })
      if (close) this.props.finishEditing()
    }

    changeCategory = (val) => {
      this.setState({ categoryId: val })
      this.props.actions.editCharacter(this.props.character.id, { categoryId: val })
    }

    selectTab = (key) => {
      if (key == 'new') {
        this.setState({ showTemplatePicker: true })
      } else {
        this.setState({ activeTab: key })
      }
    }

    renderTemplatePicker() {
      if (!this.state.showTemplatePicker) return null

      return (
        <TemplatePicker
          modal={true}
          type={['characters']}
          isOpen={this.state.showTemplatePicker}
          close={() => this.setState({ showTemplatePicker: false })}
          onChooseTemplate={this.handleChooseTemplate}
          canMakeCharacterTemplates={!!this.props.customAttributes.length}
        />
      )
    }

    renderRemoveTemplate() {
      const { removing, removeWhichTemplate } = this.state
      const { character } = this.props
      if (!removing) return null
      let templateData = getTemplateById(removeWhichTemplate)
      if (!templateData) {
        templateData = character.templates.find((t) => t.id == removeWhichTemplate) || {}
      }
      return (
        <DeleteConfirmModal
          customText={t(
            'Are you sure you want to remove the {template} template and all its data?',
            { template: templateData.name || t('Template') }
          )}
          onDelete={this.finishRemoveTemplate}
          onCancel={this.cancelRemoveTemplate}
        />
      )
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.character.name || t('New Character')}
          onDelete={this.deleteCharacter}
          onCancel={this.cancelDelete}
        />
      )
    }

    renderEditingImage() {
      const { character, ui } = this.props

      let imgId = this.state.newImageId || character.imageId
      return (
        <FormGroup>
          <ControlLabel>{t('Character Thumbnail')}</ControlLabel>
          <div className="character-list__character__edit-image-wrapper">
            <div className="character-list__character__edit-image">
              <Image size="large" shape="circle" imageId={imgId} />
            </div>
            <div>
              <ImagePicker
                selectedId={imgId}
                chooseImage={(id) => this.setState({ newImageId: id })}
                darkMode={ui.darkMode}
                deleteButton
              />
            </div>
          </div>
        </FormGroup>
      )
    }

    renderEditingCustomAttributes() {
      const { character, ui, customAttributes } = this.props
      return customAttributes.map((attr, index) => {
        const editorPath = helpers.editors.characterCustomAttributeEditorPath(
          this.props.character.id,
          attr.name
        )
        return (
          <React.Fragment key={attr.name}>
            <EditAttribute
              index={index}
              entity={character}
              entityType="character"
              value={character[attr.name]}
              editorPath={editorPath}
              ui={ui}
              onChange={this.handleAttrChange(attr.name)}
              onSave={this.saveEdit}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        )
      })
    }

    renderEditingTemplates() {
      const { character, ui } = this.props
      return character.templates.map((template, idx) => {
        const templateData = getTemplateById(template.id) || template || {}
        const templateValues = character.templates.find((template) => template.id === t.id)
        const attrs = template.attributes.map((attr, index) => {
          const editorPath = helpers.editors.characterTemplateAttributeEditorPath(
            this.props.character.id,
            t.id,
            attr.name
          )
          return (
            <React.Fragment key={index}>
              <EditAttribute
                templateAttribute
                index={index}
                entity={character}
                entityType="character"
                value={templateValues && templateValues[attr.name]}
                editorPath={editorPath}
                ui={ui}
                inputId={`${template.id}-${attr.name}Input`}
                onChange={this.handleTemplateAttrChange(template.id, attr.name)}
                onSave={this.saveEdit}
                name={attr.name}
                type={attr.type}
              />
            </React.Fragment>
          )
        })
        let link = null
        if (templateData.link) {
          link = (
            <a
              className="template-picker__link"
              title={templateData.link}
              onClick={() => openExternal(templateData.link)}
            >
              <Glyphicon glyph="info-sign" />
            </a>
          )
        }
        return (
          <Tab eventKey={idx + 3} title={templateData.name || t('Template')} key={`tab-${idx}`}>
            <div className="template-tab__details">
              <p>
                {templateData.description}
                {link}
              </p>
              <Button
                bsStyle="link"
                className="text-danger"
                onClick={() => this.beginRemoveTemplate(template.id)}
              >
                {t('Remove template')}
              </Button>
            </div>
            {attrs}
          </Tab>
        )
      })
    }

    render() {
      const { character, ui } = this.props
      return (
        <div className="character-list__character-wrapper">
          {this.renderDelete()}
          {this.renderRemoveTemplate()}
          {this.renderTemplatePicker()}
          <div className={cx('character-list__character', 'editing', { darkmode: ui.darkMode })}>
            <div className="character-list__character__edit-form">
              <div className="character-list__inputs__normal">
                <FormGroup>
                  <ControlLabel>{t('Name')}</ControlLabel>
                  <FormControl
                    type="text"
                    inputRef={(ref) => {
                      this.nameInputRef = ref
                    }}
                    autoFocus
                    onKeyDown={this.handleEsc}
                    onKeyPress={this.handleEnter}
                    defaultValue={character.name}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>{t('Short Description')}</ControlLabel>
                  <FormControl
                    type="text"
                    inputRef={(ref) => {
                      this.descriptionInputRef = ref
                    }}
                    onKeyDown={this.handleEsc}
                    onKeyPress={this.handleEnter}
                    defaultValue={character.description}
                  />
                </FormGroup>
              </div>
              <div className="character-list__inputs__custom">
                <FormGroup>
                  <ControlLabel>{t('Category')}</ControlLabel>
                  <CategoryPicker
                    type="characters"
                    selectedId={this.state.categoryId}
                    onChange={this.changeCategory}
                  />
                </FormGroup>
                {this.renderEditingImage()}
              </div>
            </div>
            <Tabs
              activeKey={this.state.activeTab}
              id="tabs"
              className="character-list__character__tabs"
              onSelect={this.selectTab}
            >
              <Tab eventKey={1} title={t('Notes')}>
                <RichText
                  description={character.notes}
                  onChange={this.handleNotesChanged}
                  selection={this.props.selection}
                  editable
                  autofocus={false}
                  darkMode={this.props.ui.darkMode}
                />
              </Tab>
              <Tab eventKey={2} title={t('Attributes')}>
                <a
                  href="#"
                  className="card-dialog__custom-attributes-configuration-link"
                  onClick={this.props.openAttributes}
                >
                  {t('Configure')}
                </a>
                {this.renderEditingCustomAttributes()}
              </Tab>
              {this.renderEditingTemplates()}
              {!templatesDisabled && <Tab eventKey="new" title={t('+ Add Template')}></Tab>}
            </Tabs>
            <ButtonToolbar className="card-dialog__button-bar">
              <Button bsStyle="success" onClick={this.saveEdit}>
                {t('Save')}
              </Button>
              <Button className="card-dialog__delete" onClick={this.handleDelete}>
                {t('Delete')}
              </Button>
            </ButtonToolbar>
          </div>
        </div>
      )
    }

    static propTypes = {
      characterId: PropTypes.number.isRequired,
      openAttributes: PropTypes.func,
      character: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
      customAttributes: PropTypes.array.isRequired,
      ui: PropTypes.object.isRequired,
      finishEditing: PropTypes.func.isRequired,
      selection: PropTypes.object.isRequired,
      editorPath: PropTypes.string.isRequired,
    }
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        const editorPath = helpers.editors.characterNotesEditorPath(ownProps.characterId)
        return {
          character: selectors.singleCharacterSelector(state.present, ownProps.characterId),
          customAttributes: state.present.customAttributes.characters,
          selection: selectors.selectionSelector(state.present, editorPath),
          editorPath,
          ui: state.present.ui,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.character, dispatch),
        }
      }
    )(CharacterEditDetails)
  }

  throw new Error('Cannot connect CharacterEditDetails')
}

export default CharacterEditDetailsConnector
