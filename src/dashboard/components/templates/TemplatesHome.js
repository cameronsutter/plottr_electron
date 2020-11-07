import React, { useState } from 'react'
import { FormControl } from 'react-bootstrap'
import t from 'format-message'
import CustomTemplates from './CustomTemplates'
import StarterTemplates from './StarterTemplates'

export default function TemplatesHome (props) {
  const [type, setType] = useState('plotlines')

  return <div className='dashboard__templates'>
    <FormControl type='search' placeholder={t('Search')} className='dashboard__search' />
    <CustomTemplates type={type}/>
    <StarterTemplates type={type}/>
  </div>
}