import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'

const StarterTemplatesConnector = (connector) => {
  const {
    platform: {
      template: { useTemplatesInfo, useFilteredSortedTemplates },
    },
  } = connector

  const StarterTemplates = ({ type, searchTerm }) => {
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

  StarterTemplates.propTypes = {
    type: PropTypes.string,
    searchTerm: PropTypes.string,
  }

  return StarterTemplates
}

export default StarterTemplatesConnector
