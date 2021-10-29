import React from 'react'
import { t } from 'plottr_locales'
import PropTypes from 'react-proptypes'

export default function AccountHeader({ os }) {
  const imgSrc = os == 'unknown' ? '/logo_28_500.png' : '../icons/logo_28_500.png'
  return (
    <div className="dashboard__account__header text-center">
      <h1>
        <img src={imgSrc} style={{ height: 125 }} /> {t('Welcome to Plottr')}
      </h1>
    </div>
  )
}

AccountHeader.propTypes = {
  os: PropTypes.string,
}
