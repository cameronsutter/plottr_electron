import React from 'react'
import { t } from 'plottr_locales'

export default function AccountHeader(props) {
  return (
    <div className="dashboard__account__header text-center">
      <h1>
        <img src="/logo_28_500.png" style={{ height: 125 }} /> {t('Welcome to Plottr')}
      </h1>
    </div>
  )
}
