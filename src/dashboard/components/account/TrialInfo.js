import React from 'react'
import t from 'format-message'
import cx from 'classnames'

export default function TrialInfo ({trialInfo}) {
  const {startedOn, endsOn, daysLeft} = trialInfo
  const startedDate = new Date(startedOn)
  const fewDays = daysLeft < 10

  return <div className='dashboard__user-info'>
    <h1>{t('Free Trial Information')}</h1>
    <div className='dashboard__user-info__wrapper'>
      <dl className='dl-horizontal'>
        <dt>{t('Started On')}</dt>
        <dd>{t('{date, date, long}', {date: startedDate})}</dd>
        <dt>{t('Days Left')}</dt>
        <dd className={cx({lead: fewDays, 'text-danger': fewDays})}>{daysLeft}</dd>
      </dl>
      <dl className='dl-horizontal'>
        <dt>{t('Ends After')}</dt>
        <dd>{t('{date, date, long}', {date: endsOn})}</dd>
      </dl>
    </div>
  </div>
}