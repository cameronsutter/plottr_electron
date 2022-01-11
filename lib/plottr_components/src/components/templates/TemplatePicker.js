import React, { useState, useEffect, Fragment } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { ButtonToolbar, Button, Glyphicon, FormControl } from 'react-bootstrap'
import cx from 'classnames'
import UnconnectedPlottrModal from '../PlottrModal'
import UnconnectedPlotlineTemplateDetails from './PlotlineTemplateDetails'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import CharacterTemplateDetails from './CharacterTemplateDetails'
import CardTemplateDetails from './CardTemplateDetails'
import ProjectTemplateDetails from './ProjectTemplateDetails'
import TemplateEdit from './TemplateEdit'
import getTestIds from '../getTestIds'
import { template } from 'pltr/v2'

import { checkDependencies } from '../checkDependencies'

export const testIds = getTestIds()

const { lineFromTemplate, projectFromTemplate } = template
const modalStyles = { content: { width: '50%', marginLeft: '25%' } }

const typeMap = {
  project: t('Project Templates'),
  plotlines: t('Starter Templates'),
  characters: t('Starter Templates'),
  scenes: t('Starter Templates'),
}

const subCatMap = {
  all: t('All'),
  children: t('Children'),
  comedy: t('Comedy'),
  general: t('General'),
  horror: t('Horror'),
  romance: t('Romance'),
  mystery: t('Mystery'),
  action: t('Action'),
  screenplay: t('Screenplay'),
  shortstory: t('Short Story'),
  playwriting: t('Playwriting'),
  nonfiction: t('Nonfiction'),
}

const subCategories = [
  'all',
  'action',
  'children',
  'general',
  'horror',
  'mystery',
  'nonfiction',
  'playwriting',
  'romance',
  'screenplay',
  'shortstory',
]

const TemplatePickerConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)
  const PlotlineTemplateDetails = UnconnectedPlotlineTemplateDetails(connector)

  const {
    platform: {
      appVersion,
      openExternal,
      log,
      template: { deleteTemplate, editTemplateDetails },
    },
  } = connector
  checkDependencies({
    log,
    appVersion,
    openExternal,
    deleteTemplate,
    editTemplateDetails,
  })

  const TemplatePicker = ({
    newProject,
    modal,
    close,
    onChooseTemplate,
    isOpen,
    types,
    darkMode,
    canMakeCharacterTemplates,
    showCancelButton,
    confirmButtonText,
    starterTemplates,
    userCustomTemplates,
    getTemplateById,
  }) => {
    const [selectedId, setSelectedId] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedType, setSelectedType] = useState(null)
    const [editing, setEditing] = useState(false)
    const [templates, setTemplates] = useState(null)
    const [customTemplates, setCustomTemplates] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteWhich, setDeleteWhich] = useState(null)
    const [subCategory, setSubCategory] = useState(null)

    useEffect(() => {
      if (templates || customTemplates) return

      let newTemplates = {}
      let newCustomTemplates = []
      types.forEach((type) => {
        newTemplates[type] = starterTemplates.filter((template) => template.type === type)
        newCustomTemplates = [
          ...newCustomTemplates,
          ...userCustomTemplates.filter((template) => template.type === type),
        ]
      })
      setTemplates(newTemplates)
      setCustomTemplates(newCustomTemplates)
    }, [setTemplates, setCustomTemplates, templates, customTemplates])

    const onSubCatChange = (e) => {
      const val = e.target.value
      setSubCategory(val)
    }

    const deleteTemplate = (e) => {
      e.stopPropagation()
      deleteTemplate(deleteWhich.id)
      setCustomTemplates(
        types.flatMap((type) => userCustomTemplates.filter((template) => template.type === type))
      )
      setDeleting(false)
      setDeleteWhich(null)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
      setDeleteWhich(null)
    }

    const handleDelete = (e, template) => {
      e.stopPropagation()
      setDeleting(true)
      setDeleteWhich(template)
    }

    const findSelectedTemplate = () => {
      if (selectedCategory == 'custom') {
        return customTemplates?.find((template) => template.id == selectedId)
      }

      if (selectedCategory == 'starter') {
        if (!templates) return null
        return templates[selectedType].find((template) => template.id == selectedId)
      }
    }

    const editTemplate = (e) => {
      e.stopPropagation()
      setEditing(true)
    }

    const saveTemplateEdit = (data) => {
      editTemplateDetails(data.id, {
        ...getTemplateById(data.id),
        ...data,
      })
      const newCustomTemplates = types.flatMap((type) =>
        userCustomTemplates.filter((template) => template.type === type)
      )
      setEditing(false)
      setCustomTemplates(newCustomTemplates)
    }

    const chooseTemplate = () => {
      if (!selectedId) return
      const selectedTemplate = findSelectedTemplate()
      const { type } = selectedTemplate
      if (type === 'project' || type === 'plotlines') {
        const migrator = newProject ? projectFromTemplate : lineFromTemplate
        migrator(
          selectedTemplate,
          appVersion,
          '',
          (error, template) => {
            if (error) {
              // Let the ErrorBoundary handle the error
              throw new Error(error)
            }
            onChooseTemplate(template)
          },
          log
        )
      } else {
        onChooseTemplate(selectedTemplate)
      }
    }

    const renderDelete = () => {
      if (!deleting) return null

      return (
        <DeleteConfirmModal
          name={deleteWhich.name}
          onDelete={deleteTemplate}
          onCancel={cancelDelete}
        />
      )
    }

    const renderLink = (template) => {
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

    const renderCustomButtons = (category, selected, template) => {
      if (category != 'custom') return null
      if (!selected) return null

      return (
        <div>
          <Button data-testid={testIds.edit} bsSize="small" onClick={(e) => editTemplate(e)}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button
            data-testid={testIds.delete}
            bsSize="small"
            onClick={(e) => handleDelete(e, template)}
          >
            <Glyphicon glyph="trash" />
          </Button>
        </div>
      )
    }

    const renderTemplateDetails = () => {
      if (!selectedId) return null

      const template = findSelectedTemplate()
      if (!template) return null

      let edit = null
      if (editing) {
        edit = (
          <TemplateEdit
            template={template}
            darkMode={darkMode}
            saveEdit={saveTemplateEdit}
            cancel={() => setEditing(false)}
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
              {renderLink(template)}
            </h3>
            <p data-testid={testIds[`description-${template.id}`]}>{template.description}</p>
          </div>
          {edit}
          {details}
        </div>
      )
    }

    const renderTemplateList = (list, category, type) => {
      // modal but not open
      if (modal && !isOpen) return null

      if (!list) return null

      return list.map((template) => {
        let selected = selectedCategory == category && selectedId == template.id
        let klasses = cx('list-group-item', { selected })
        return (
          <li
            key={template.id}
            data-testid={testIds[`template-${template.id}`]}
            className={klasses}
            onClick={() => {
              setSelectedId(template.id)
              setSelectedCategory(category)
              setSelectedType(type)
              setEditing(false)
            }}
          >
            <div>{template.name}</div>
            {renderCustomButtons(category, selected, template)}
          </li>
        )
      })
    }

    const renderStarterTemplates = () => {
      if (!templates) return null

      const listTypes = Object.keys(templates)
      return listTypes.map((type) => {
        if (type == 'plotlines') {
          if (subCategory && subCategory !== 'all') {
            // only 1 subCategory
            const subCat = subCategory
            let list = templates[type].filter((t) => {
              return t.categories && t.categories.includes(subCat)
            })
            let title = typeMap[type]
            return renderListFragment(subCat, title, list, 'starter', type)
          } else {
            // all
            let list = templates[type]
            let title = typeMap[type]
            return renderListFragment(type, title, list, 'starter', type)
          }
        } else {
          let list = templates[type]
          let title = typeMap[type]
          return renderListFragment(type, title, list, 'starter', type)
        }
      })
    }

    const renderListFragment = (key, title, list, category, type) => {
      let chooser = null
      if (type == 'plotlines') {
        chooser = renderSubCategoryPicker()
      }
      return (
        <Fragment key={key}>
          <h1>{title}</h1>
          {chooser}
          <ul className="list-group">{renderTemplateList(list, category, type)}</ul>
        </Fragment>
      )
    }

    const renderSubCategoryPicker = () => {
      const options = subCategories.map((sc) => (
        <option value={sc} key={sc}>
          {subCatMap[sc]}
        </option>
      ))

      return (
        <FormControl componentClass="select" onChange={onSubCatChange} value={subCategory || 'all'}>
          {options}
        </FormControl>
      )
    }

    const renderBody = () => {
      return (
        <div className="template-picker__dialog-wrapper">
          {renderDelete()}
          <div className="template-picker__wrapper">
            <div className="template-picker__list">
              <h1>{t('My Templates')}</h1>
              <ul className="list-group">{renderTemplateList(customTemplates, 'custom')}</ul>
              {renderStarterTemplates()}
            </div>
            <div className="template-picker__details">{renderTemplateDetails()}</div>
          </div>
          <ButtonToolbar className="card-dialog__button-bar">
            {showCancelButton && (
              <Button data-testid={testIds.cancel} onClick={close}>
                {t('Cancel')}
              </Button>
            )}
            <Button
              data-testid={testIds.confirm}
              bsStyle="success"
              onClick={chooseTemplate}
              disabled={!selectedId}
            >
              {confirmButtonText}
            </Button>
          </ButtonToolbar>
        </div>
      )
    }

    if (modal) {
      return (
        <PlottrModal isOpen={isOpen} onRequestClose={close} style={modalStyles}>
          {renderBody()}
        </PlottrModal>
      )
    } else {
      return renderBody()
    }
  }

  TemplatePicker.defaultProps = {
    showCancelButton: true,
    confirmButtonText: t('Choose'),
    close: () => {},
  }

  TemplatePicker.propTypes = {
    newProject: PropTypes.bool,
    modal: PropTypes.bool.isRequired,
    close: PropTypes.func,
    onChooseTemplate: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    types: PropTypes.array,
    darkMode: PropTypes.bool,
    canMakeCharacterTemplates: PropTypes.bool,
    showCancelButton: PropTypes.bool,
    confirmButtonText: PropTypes.string,
    getTemplateById: PropTypes.func.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      starterTemplates: selectors.templatesSelector(state.present),
      userCustomTemplates: selectors.customTemplatesSelector(state.present),
      getTemplateById: (templateId) => selectors.templateByIdSelector(state.present, templateId),
    }))(TemplatePicker)
  }

  throw new Error('Could not connect TemplatePicker')
}

export default TemplatePickerConnector
