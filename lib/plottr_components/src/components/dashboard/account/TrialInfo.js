import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { FaKey } from 'react-icons/fa'
import UnconnectedVerifyView from './VerifyView'

const TrialInfoConnector = (connector) => {
  const VerifyView = UnconnectedVerifyView(connector)

  const TrialInfo = ({ trialInfo, daysLeft, darkMode }) => {
    const { startsAt, endsAt } = trialInfo
    const [showVerify, setShowVerify] = useState(false)
    const startedDate = new Date(startsAt)
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
            <dd>{t('{date, date, long}', { date: endsAt })}</dd>
            <dt>{t('License')}</dt>
            <dd>
              <a
                href="#"
                draggable={false}
                onClick={() => setShowVerify(true)}
                className={cx({ darkmode: darkMode })}
              >
                <FaKey />
                {t('Activate License')}
              </a>
            </dd>
          </dl>
        </div>
        {showVerify ? <VerifyView goBack={() => setShowVerify(false)} success={() => {}} /> : null}
      </div>
    )
  }

  TrialInfo.propTypes = {
    trialInfo: PropTypes.object,
    daysLeft: PropTypes.number,
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
      daysLeft: selectors.daysLeftOfTrialSelector(state.present),
      darkMode: selectors.isDarkModeSelector(state.present),
    }))(TrialInfo)
  }

  throw new Error('Could not connect TrialInfo')
}

export default TrialInfoConnector
