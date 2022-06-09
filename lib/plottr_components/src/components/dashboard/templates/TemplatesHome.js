import React, { useRef, useState } from 'react'

import { t } from 'plottr_locales'

import FormControl from '../../FormControl'
import UnconnectedCustomTemplates from './CustomTemplates'
import UnconnectedStarterTemplates from './StarterTemplates'

const TemplatesHomeConnector = (connector) => {
  const CustomTemplates = UnconnectedCustomTemplates(connector)
  const StarterTemplates = UnconnectedStarterTemplates(connector)

  const TemplatesHome = (props) => {
    const [searchTerm, setSearchTerm] = useState('')
    const type = useRef('plotlines').current

    return (
      <div className="dashboard__templates">
        <FormControl
          type="search"
          placeholder={t('Search')}
          className="dashboard__search"
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <CustomTemplates type={type} searchTerm={searchTerm} />
        <StarterTemplates type={type} searchTerm={searchTerm} />
      </div>
    )
  }

  return TemplatesHome
}

export default TemplatesHomeConnector
