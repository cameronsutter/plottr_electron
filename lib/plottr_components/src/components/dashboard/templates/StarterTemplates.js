import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'

const StarterTemplatesConnector = (connector) => {
  const StarterTemplates = ({ templates }) => {
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
    type: PropTypes.string.isRequired,
    searchTerm: PropTypes.string.isRequired,
    templates: PropTypes.array.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state, { type, searchTerm }) => ({
      templates: selectors.filteredSortedStarterTemplatesSelector(state.present, type, searchTerm),
    }))(StarterTemplates)
  }

  throw new Error('Could not connect StarterTemplates')
}

export default StarterTemplatesConnector
