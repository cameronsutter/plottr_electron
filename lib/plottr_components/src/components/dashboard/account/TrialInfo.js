import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { FaKey } from 'react-icons/fa'
import UnconnectedVerifyView from './VerifyView'

const TrialInfoConnector = (connector) => {
  const VerifyView = UnconnectedVerifyView(connector)

  const TrialInfo = ({ trialInfo, darkMode }) => {
    const { startedOn, endsOn, daysLeft } = trialInfo
    const [showVerify, setShowVerify] = useState(false)
    const startedDate = new Date(startedOn)
    const fewDays = daysLeft < 10

    return (
      <div className="dashboard__user-info">
        <h2>{t('Free Trial Information')}</h2>
        <hr />
        <div className="dashboard__user-info__wrapper">
          <dl className="dl-horizontal">
            <dt>{t('Started On')}</dt>
            <dd>{t('{date, date, long}', { date: startedDate })}</dd>
            <dt>{t('Days Left')}</dt>
            <dd className={cx({ lead: fewDays, 'text-danger': fewDays, darkmode: darkMode })}>
              {daysLeft}
            </dd>
          </dl>
          <dl className="dl-horizontal">
            <dt>{t('Ends After')}</dt>
            <dd>{t('{date, date, long}', { date: endsOn })}</dd>
            <dt>{t('License')}</dt>
            <dd>
              <a
                href="#"
                onClick={() => setShowVerify(true)}
                className={cx({ darkmode: darkMode })}
              >
                <FaKey />
                {t('Activate License')}
              </a>
            </dd>
          </dl>
        </div>
        {showVerify ? <VerifyView darkMode={darkMode} goBack={() => setShowVerify(false)} /> : null}
      </div>
    )
  }

  TrialInfo.propTypes = {
    trialInfo: PropTypes.object,
    darkMode: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      trialInfo: selectors.trialInfoSelector(state.present),
    }))
  }

  throw new Error('Could not connect TrialInfo')
}

export default TrialInfoConnector
