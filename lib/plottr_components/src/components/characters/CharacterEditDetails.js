import React, { useState, useRef, useEffect } from 'react'
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
    platform: { templatesDisabled, openExternal },
    pltr: { helpers },
  } = connector

  checkDependencies({
    templatesDisabled,
    openExternal,
  })

  const CharacterEditDetails = ({
    finishEditing,
    character,
    actions,
    editorPath,
    customAttributes,
    getTemplateById,
    darkMode,
    templateAttributeValue,
    selection,
    openAttributes,
  }) => {
    const [categoryId, setCategoryId] = useState(character.categoryId || null)
    const [newImageId, setNewImageId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [removing, setRemoving] = useState(false)
    const [removeWhichTemplate, setRemoveWhichTemplate] = useState(null)
    const [activeTab, setActiveTab] = useState(1)
    const [showTemplatePicker, setShowTemplatePicker] = useState(false)

    const nameInputRef = useRef(null)
    const descriptionInputRef = useRef(null)

    const saveEdit = (close = true) => {
      var name = nameInputRef.current.value || character.name
      var description = descriptionInputRef.current.value
      var attrs = {}
      if (newImageId) {
        attrs.imageId = newImageId == -1 ? null : newImageId
      }
      actions.editCharacter(character.id, {
        name,
        description,
        categoryId: categoryId == -1 ? null : categoryId,
        ...attrs,
      })
      if (close) finishEditing()
    }

    useEffect(() => {
      return () => {
        saveEdit()
      }
    }, [])

    const deleteCharacter = (e) => {
      e.stopPropagation()
      actions.deleteCharacter(character.id)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      setDeleting(true)
    }

    const beginRemoveTemplate = (templateId) => {
      setRemoving(true)
      setRemoveWhichTemplate(templateId)
    }

    const finishRemoveTemplate = (e) => {
      e.stopPropagation()
      setActiveTab(activeTab - 1)
      actions.removeTemplateFromCharacter(character.id, removeWhichTemplate)
      setRemoving(false)
      setRemoveWhichTemplate(null)
    }

    const cancelRemoveTemplate = (e) => {
      e.stopPropagation()
      setRemoving(false)
      setRemoveWhichTemplate(null)
    }

    const handleEnter = (event) => {
      if (event.which === 13) {
        saveEdit()
      }
    }

    const handleEsc = (event) => {
      if (event.which === 27) {
        saveEdit()
      }
    }

    const handleChooseTemplate = (templateData) => {
      actions.addTemplateToCharacter(character.id, templateData)
      const numTemplates = character.templates.length
      setShowTemplatePicker(false)
      setActiveTab(numTemplates + 3)
    }

    const handleNotesChanged = (value, selection) => {
      actions.editCharacter(
        character.id,
        helpers.editors.attrIfPresent('notes', value),
        editorPath,
        selection
      )
    }

    const handleAttrChange = (attrName) => (desc, selection) => {
      const editorPath = helpers.editors.characterCustomAttributeEditorPath(character.id, attrName)
      actions.editCharacter(
        character.id,
        helpers.editors.attrIfPresent(attrName, desc),
        editorPath,
        selection
      )
    }

    const handleTemplateAttrChange = (id, name) => (desc, selection) => {
      const editorPath = helpers.editors.characterTemplateAttributeEditorPath(
        character.id,
        id,
        name
      )

      if (!desc) {
        actions.editCharacter(character.id, {}, editorPath, selection)
        return
      }
      actions.editCharacterTemplateAttribute(character.id, id, name, desc, editorPath, selection)
    }

    const changeCategory = (val) => {
      setCategoryId(val)
      actions.editCharacter(character.id, { categoryId: val })
    }

    const selectTab = (key) => {
      if (key == 'new') {
        setShowTemplatePicker(true)
      } else {
        setActiveTab(key)
      }
    }

    const renderTemplatePicker = () => {
      if (!showTemplatePicker) return null

      return (
        <TemplatePicker
          modal={true}
          types={['characters']}
          isOpen={showTemplatePicker}
          close={() => setShowTemplatePicker(false)}
          onChooseTemplate={handleChooseTemplate}
          canMakeCharacterTemplates={!!customAttributes.length}
        />
      )
    }

    const renderRemoveTemplate = () => {
      if (!removing) return null
      let templateData = getTemplateById(removeWhichTemplate)
      if (!templateData) {
        templateData = character.templates.find((t) => t.id == removeWhichTemplate) || {}
      }
      return (
        <DeleteConfirmModal
          customText={t(
            'Are you sure you want to remove the {template} template and all its data?',
            { template: templateData?.name || t('Template') }
          )}
          onDelete={finishRemoveTemplate}
          onCancel={cancelRemoveTemplate}
        />
      )
    }

    const renderDelete = () => {
      if (!deleting) return null

      return (
        <DeleteConfirmModal
          name={character.name || t('New Character')}
          onDelete={deleteCharacter}
          onCancel={cancelDelete}
        />
      )
    }

    const renderEditingImage = () => {
      let imgId = newImageId || character.imageId
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
                chooseImage={(id) => setNewImageId(id)}
                darkMode={darkMode}
                deleteButton
              />
            </div>
          </div>
        </FormGroup>
      )
    }

    const renderEditingCustomAttributes = () => {
      return customAttributes.map((attr, index) => {
        const editorPath = helpers.editors.characterCustomAttributeEditorPath(
          character.id,
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
              onChange={handleAttrChange(attr.name)}
              onSave={saveEdit}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        )
      })
    }

    const renderEditingTemplates = () => {
      return character.templates.map((template, idx) => {
        const templateData = getTemplateById(template.id)
        const attrs = template.attributes.map((attr, index) => {
          const editorPath = helpers.editors.characterTemplateAttributeEditorPath(
            character.id,
            template.id,
            attr.name
          )
          return (
            <React.Fragment key={index}>
              <EditAttribute
                templateAttribute
                index={index}
                entity={character}
                entityType="character"
                valueSelector={templateAttributeValue(template.id, attr.name)}
                editorPath={editorPath}
                inputId={`${template.id}-${attr.name}Input`}
                onChange={handleTemplateAttrChange(template.id, attr.name)}
                onSave={saveEdit}
                name={attr.name}
                type={attr.type}
              />
            </React.Fragment>
          )
        })
        let link = null
        if (templateData?.link) {
          link = (
            <a
              className="template-picker__link"
              title={templateData?.link}
              onClick={() => openExternal(templateData?.link)}
            >
              <Glyphicon glyph="info-sign" />
            </a>
          )
        }
        return (
          <Tab
            eventKey={idx + 3}
            title={templateData?.name || template.name || t('Template')}
            key={`tab-${idx}`}
          >
            <div className="template-tab__details">
              <p>
                {templateData?.description}
                {link}
              </p>
              <Button
                bsStyle="link"
                className="text-danger"
                onClick={() => beginRemoveTemplate(template.id)}
              >
                {t('Remove template')}
              </Button>
            </div>
            {attrs}
          </Tab>
        )
      })
    }

    return (
      <div className="character-list__character-wrapper">
        {renderDelete()}
        {renderRemoveTemplate()}
        {renderTemplatePicker()}
        <div className={cx('character-list__character', 'editing', { darkmode: darkMode })}>
          <div className="character-list__character__edit-form">
            <div className="character-list__inputs__normal">
              <FormGroup>
                <ControlLabel>{t('Name')}</ControlLabel>
                <FormControl
                  type="text"
                  inputRef={(ref) => {
                    nameInputRef.current = ref
                  }}
                  autoFocus
                  onKeyDown={handleEsc}
                  onKeyPress={handleEnter}
                  defaultValue={character.name}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{t('Short Description')}</ControlLabel>
                <FormControl
                  type="text"
                  inputRef={(ref) => {
                    descriptionInputRef.current = ref
                  }}
                  onKeyDown={handleEsc}
                  onKeyPress={handleEnter}
                  defaultValue={character.description}
                />
              </FormGroup>
            </div>
            <div className="character-list__inputs__custom">
              <FormGroup>
                <ControlLabel>{t('Category')}</ControlLabel>
                <CategoryPicker
                  type="characters"
                  selectedId={categoryId}
                  onChange={changeCategory}
                />
              </FormGroup>
              {renderEditingImage()}
            </div>
          </div>
          <Tabs
            activeKey={activeTab}
            id="tabs"
            className="character-list__character__tabs"
            onSelect={selectTab}
          >
            <Tab eventKey={1} title={t('Notes')}>
              <RichText
                id={editorPath}
                description={character.notes}
                onChange={handleNotesChanged}
                selection={selection}
                editable
                autofocus={false}
                darkMode={darkMode}
              />
            </Tab>
            <Tab eventKey={2} title={t('Attributes')}>
              <a
                href="#"
                className="card-dialog__custom-attributes-configuration-link"
                onClick={openAttributes}
              >
                {t('Configure')}
              </a>
              {renderEditingCustomAttributes()}
            </Tab>
            {renderEditingTemplates()}
            {!templatesDisabled && <Tab eventKey="new" title={t('+ Add Template')}></Tab>}
          </Tabs>
          <ButtonToolbar className="card-dialog__button-bar">
            <Button bsStyle="success" onClick={saveEdit}>
              {t('Save')}
            </Button>
            <Button className="card-dialog__delete" onClick={handleDelete}>
              {t('Delete')}
            </Button>
          </ButtonToolbar>
        </div>
      </div>
    )
  }

  CharacterEditDetails.propTypes = {
    characterId: PropTypes.number.isRequired,
    openAttributes: PropTypes.func,
    character: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributes: PropTypes.array.isRequired,
    darkMode: PropTypes.bool,
    finishEditing: PropTypes.func.isRequired,
    selection: PropTypes.object.isRequired,
    editorPath: PropTypes.string.isRequired,
    getTemplateById: PropTypes.func.isRequired,
    templateAttributeValue: PropTypes.func.isRequired,
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
          darkMode: selectors.isDarkModeSelector(state.present),
          getTemplateById: (templateId) =>
            selectors.templateByIdSelector(state.present, templateId),
          templateAttributeValue: (templateId, attributeName) => {
            return selectors.characterTemplateAttributeValueSelector(
              ownProps.characterId,
              templateId,
              attributeName
            )
          },
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
