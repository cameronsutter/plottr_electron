import React from 'react'
import t from 'format-message'
import { useTemplatesInfo } from '../../../common/utils/store_hooks'
import { useFilteredSortedTemplates } from '../../utils/templates'

export default function StarterTemplates({ type, searchTerm }) {
  const [templateInfo] = useTemplatesInfo()
  const templates = useFilteredSortedTemplates(templateInfo, type, searchTerm)

  const renderedTemplates = templates.map((t) => {
    return (
      <div key={t.id} className="dashboard__template-section__item starter">
        <div>{t.name}</div>
      </div>
    )
  })

  return (
    <div className="dashboard__template-section">
      <h1>{t('Starter Templates')}</h1>
      <div className="dashboard__template-section__wrapper">{renderedTemplates}</div>
    </div>
  )
}
