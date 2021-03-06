import React, { useRef, useState } from 'react'
import { FormControl } from 'react-bootstrap'
import { t } from 'plottr_locales'
import CustomTemplates from './CustomTemplates'
import StarterTemplates from './StarterTemplates'

export default function TemplatesHome(props) {
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
