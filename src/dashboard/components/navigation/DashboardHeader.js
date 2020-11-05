import React from 'react'
import { is } from 'electron-util'
import t from 'format-message'


export default function DashboardHeader (props) {
  if (!is.macos) {
    // render the three buttons (minimize, maximize, close)
  }
  return <div className='dashboard__header'>{t('Plottr')}</div>
}