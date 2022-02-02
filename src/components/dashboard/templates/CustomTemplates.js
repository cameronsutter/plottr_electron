import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'

const CustomTemplatesConnector = (connector) => {
  const CustomTemplates = ({ templates }) => {
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
    templates: PropTypes.object.isRequired,
    type: PropTypes.string,
    searchTerm: PropTypes.string,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state, { type, searchTerm }) => ({
      templates: selectors.filteredSortedCustomTemplatesSelector(state.present, type, searchTerm),
    }))(CustomTemplates)
  }

  throw new Error('Could not connect CustomTemplates')
}

export default CustomTemplatesConnector
