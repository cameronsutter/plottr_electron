import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { useCustomTemplatesInfo } from '../../../common/utils/store_hooks'
import { useFilteredSortedTemplates } from '../../utils/templates'

export default function CustomTemplates({ type, searchTerm }) {
  const [templateInfo] = useCustomTemplatesInfo()
  const templates = useFilteredSortedTemplates(templateInfo, type, searchTerm)

  const renderedTemplates = templates.map((t) => {
    return (
      <div key={t.id} className="dashboard__template-section__item custom">
        <div>{t.name}</div>
      </div>
    )
  })

  return (
    <div className="dashboard__template-section">
      <h1>{t('Custom Templates')}</h1>
      <div className="dashboard__template-section__wrapper">{renderedTemplates}</div>
    </div>
  )
}

CustomTemplates.propTypes = {
  type: PropTypes.string,
  searchTerm: PropTypes.string,
}
