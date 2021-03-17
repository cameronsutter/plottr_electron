import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { FaKey } from 'react-icons/fa'
import VerifyView from './VerifyView'

export default function TrialInfo({ trialInfo }) {
  const { startedOn, endsOn, daysLeft } = trialInfo
  const [showVerify, setShowVerify] = useState(false)
  const startedDate = new Date(startedOn)
  const fewDays = daysLeft < 10

  return (
    <div className="dashboard__user-info">
      <h1>{t('Free Trial Information')}</h1>
      <div className="dashboard__user-info__wrapper">
        <dl className="dl-horizontal">
          <dt>{t('Started On')}</dt>
          <dd>{t('{date, date, long}', { date: startedDate })}</dd>
          <dt>{t('Days Left')}</dt>
          <dd className={cx({ lead: fewDays, 'text-danger': fewDays })}>{daysLeft}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{t('Ends After')}</dt>
          <dd>{t('{date, date, long}', { date: endsOn })}</dd>
          <dt>{t('License')}</dt>
          <dd>
            <a href="#" onClick={() => setShowVerify(true)}>
              <FaKey />
              {t('Activate License')}
            </a>
          </dd>
        </dl>
      </div>
      {showVerify ? <VerifyView goBack={() => setShowVerify(false)} /> : null}
    </div>
  )
}

TrialInfo.propTypes = {
  trialInfo: PropTypes.object,
}
