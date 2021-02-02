import { shell } from 'electron'
import React, { useState } from 'react'
import t from 'format-message'
import cx from 'classnames'
import { Glyphicon, Button } from 'react-bootstrap'
import { useCustomTemplatesInfo } from '../../../common/utils/store_hooks'
import { useTemplatesInfo } from '../../../common/utils/store_hooks'
import { useFilteredSortedTemplates } from '../../utils/templates'
import PlotlineTemplateDetails from '../../../common/components/templates/PlotlineTemplateDetails'
import ProjectTemplateDetails from '../../../common/components/templates/ProjectTemplateDetails'

export default function TemplatePicker({ startNew }) {
  const [selected, selectTemplate] = useState(null)
  const [customTemplatesInfo] = useCustomTemplatesInfo()
  const [templatesInfo] = useTemplatesInfo()
  const customTemplates = useFilteredSortedTemplates(customTemplatesInfo, 'plotlines')
  const projectTemplates = useFilteredSortedTemplates(templatesInfo, 'project')
  const plotlineTemplates = useFilteredSortedTemplates(templatesInfo, 'plotlines')

  const renderList = (template) => {
    const isSelected = selected && selected.id == template.id
    const clickFunc = () => {
      if (isSelected) {
        startNew(template)
      } else {
        selectTemplate(template)
      }
    }
    let klasses = cx('list-group-item', { selected: isSelected })
    return (
      <li key={template.id} className={klasses} onClick={clickFunc}>
        {template.name}
      </li>
    )
  }

  const renderTemplateDetails = () => {
    if (!selected) return null

    let link = null
    if (selected.link) {
      link = (
        <a
          className="template-picker__link"
          title={selected.link}
          onClick={() => shell.openExternal(selected.link)}
        >
          <Glyphicon glyph="info-sign" />
        </a>
      )
    }

    return (
      <div className="panel panel-success">
        <div className="panel-heading">
          <h3 className="panel-title">
            {selected.name}
            {link}
          </h3>
        </div>
        <div className="panel-body">
          <p>{selected.description}</p>
          <Button bsSize="large" onClick={() => startNew(selected)}>
            {t('Create New Project')}
          </Button>
        </div>
      </div>
    )
  }

  const renderedCustom = customTemplates.map(renderList)
  const renderedProject = projectTemplates.map(renderList)
  const renderedPlotline = plotlineTemplates.map(renderList)

  return (
    <div className="dashboard__template-picker template-picker__wrapper">
      <div className="template-picker__list">
        <h2>{t('Custom Templates')}</h2>
        <ul className="list-group">{renderedCustom}</ul>
        <h2>{t('Project Templates')}</h2>
        <ul className="list-group">{renderedProject}</ul>
        <h2>{t('Starter Templates')}</h2>
        <ul className="list-group">{renderedPlotline}</ul>
      </div>
      <div className="template-picker__details">{renderTemplateDetails()}</div>
    </div>
  )
}
