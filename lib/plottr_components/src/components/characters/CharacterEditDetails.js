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
  } = connector

  class CharacterEditDetails extends Component {
    constructor(props) {
      super(props)
      let attributes = {}
      props.customAttributes.forEach((attr) => {
        const { name } = attr
        attributes[name] = props.character[name]
      })
      let templateAttrs = props.character.templates.reduce((acc, t) => {
        acc[t.id] = t.attributes.reduce((obj, attr) => {
          obj[attr.name] = attr.value
          return obj
        }, {})
        return acc
      }, {})
      this.state = {
        notes: props.character.notes,
        attributes: attributes,
        categoryId: props.character.categoryId,
        templateAttrs: templateAttrs,
        newImageId: null,
        deleting: false,
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
      // add it to state as well
      const newAttrs = {
        ...this.state.templateAttrs,
        [templateData.id]: templateData.attributes.reduce((obj, attr) => {
          obj[attr.name] = attr.value
          return obj
        }, {}),
      }
      const numTemplates = character.templates.length
      this.setState({
        templateAttrs: newAttrs,
        showTemplatePicker: false,
        activeTab: numTemplates + 1,
      })
    }

    handleAttrChange = (attrName) => (desc) => {
      const attributes = {
        ...this.state.attributes,
      }
      attributes[attrName] = desc
      this.setState({ attributes })
    }

    handleTemplateAttrChange = (id, name) => (desc) => {
      let templateAttrs = {
        ...this.state.templateAttrs,
        [id]: {
          ...this.state.templateAttrs[id],
          [name]: desc,
        },
      }
      this.setState({ templateAttrs })
    }

    saveEdit = (close = true) => {
      var name = this.nameInputRef.value || this.props.character.name
      var description = this.descriptionInputRef.value
      var notes = this.state.notes
      var attrs = {
        categoryId: this.state.categoryId == -1 ? null : this.state.categoryId,
      }
      if (this.state.newImageId) {
        attrs.imageId = this.state.newImageId == -1 ? null : this.state.newImageId
      }
      this.props.customAttributes.forEach((attr) => {
        const { name } = attr
        attrs[name] = this.state.attributes[name]
      })
      const templates = this.props.character.templates.map((t) => {
        t.attributes = t.attributes.map((attr) => {
          attr.value = this.state.templateAttrs[t.id][attr.name]
          return attr
        })
        return t
      })
      this.props.actions.editCharacter(this.props.character.id, {
        name,
        description,
        notes,
        templates,
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
        return (
          <React.Fragment key={attr.name}>
            <EditAttribute
              index={index}
              entity={character}
              entityType="character"
              value={this.state.attributes[attr.name]}
              ui={ui}
              onChange={this.handleAttrChange(attr.name)}
              onShortDescriptionKeyDown={this.handleEsc}
              onShortDescriptionKeyPress={this.handleEnter}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        )
      })
    }

    renderEditingTemplates() {
      const { character, ui } = this.props
      return character.templates.map((t, idx) => {
        const templateData = getTemplateById(t.id)
        const attrs = t.attributes.map((attr, index) => (
          <React.Fragment key={index}>
            <EditAttribute
              templateAttribute
              index={index}
              entity={character}
              entityType="character"
              value={this.state.templateAttrs[t.id][attr.name]}
              ui={ui}
              inputId={`${t.id}-${attr.name}Input`}
              onChange={this.handleTemplateAttrChange(t.id, attr.name)}
              onShortDescriptionKeyDown={this.handleEsc}
              onShortDescriptionKeyPress={this.handleEnter}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        ))
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
          <Tab eventKey={idx + 2} title={templateData.name} key={`tab-${idx}`}>
            <p>
              {templateData.description}
              {link}
            </p>
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
              <Tab eventKey={1} title={t('Attributes')}>
                <FormGroup>
                  <ControlLabel>{t('Notes')}</ControlLabel>
                  <RichText
                    description={character.notes}
                    onChange={(desc) => this.setState({ notes: desc })}
                    editable
                    autofocus={false}
                    darkMode={this.props.ui.darkMode}
                  />
                </FormGroup>
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
      character: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
      customAttributes: PropTypes.array.isRequired,
      ui: PropTypes.object.isRequired,
      finishEditing: PropTypes.func.isRequired,
    }
  }

  const {
    redux,
    pltr: {
      selectors: { singleCharacterSelector },
      actions,
    },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          character: singleCharacterSelector(state.present, ownProps.characterId),
          customAttributes: state.present.customAttributes.characters,
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
