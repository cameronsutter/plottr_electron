import React from 'react'
import { t } from 'plottr_locales'

export default function AccountHeader(props) {
  return (
    <div className="dashboard__account__header text-center">
      <h1>
        <img src="../icons/logo_28_500.png" height="125" /> {t('Welcome to Plottr')}
      </h1>
    </div>
  )
}
