import React from 'react'
import t from 'format-message'
import { machineIdSync } from 'node-machine-id'
import { Button } from 'react-bootstrap'

const deviceID = machineIdSync(true)

export default function UserInfo ({licenseInfo}) {
  const expiresDate = new Date(licenseInfo.expires)

  return <div className='dashboard__user-info'>
    <h1>{t('Account Information')}</h1>
    <div className='dashboard__user-info__wrapper'>
      <dl className='dl-horizontal'>
        <dt>{t('Purchase Email')}</dt>
        <dd>{licenseInfo.customer_email}</dd>
        <dt>{t('Device ID')}</dt>
        <dd>{deviceID}</dd>
      </dl>
      <dl className='dl-horizontal'>
        <dt>{t('License Key')}</dt>
        <dd>{licenseInfo.licenseKey}</dd>
        <dt>{t('Expiration Date')}</dt>
        <dd>{t('{date, date, long}', {date: expiresDate})}</dd>
      </dl>
    </div>
    <div className='text-right'>
      <Button bsStyle='danger' bsSize='small'>{t('Reset Account')}</Button>
      <p className='secondary-text'>{t('Use this to remove your account from Plottr on this device')}</p>
    </div>
  </div>
}