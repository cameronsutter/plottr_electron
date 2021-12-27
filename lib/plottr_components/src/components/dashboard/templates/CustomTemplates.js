import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const CustomTemplatesConnector = (connector) => {
  const {
    platform: {
      template: { useFilteredSortedTemplates },
    },
  } = connector
  checkDependencies({ useFilteredSortedTemplates })

  const CustomTemplates = ({ type, customTemplates, searchTerm }) => {
    const templates = useFilteredSortedTemplates(customTemplates, type, searchTerm)

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
    customTemplates: PropTypes.object.isRequired,
    type: PropTypes.string,
    searchTerm: PropTypes.string,
  }

  return CustomTemplates
}

export default CustomTemplatesConnector
