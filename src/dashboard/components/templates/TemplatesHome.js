import React from 'react'
import { FormControl } from 'react-bootstrap'
import t from 'format-message'

export default function TemplatesHome (props) {
  return <div className='dashboard__templates'>
    <FormControl type='search' placeholder={t('Search')} className='dashboard__search' />
  </div>
}