import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { machineIdSync } from 'node-machine-id'
import { Button } from 'react-bootstrap'
import { DeleteConfirmModal } from 'plottr_components'

const deviceID = machineIdSync(true)

export default function UserInfo({ licenseInfo, deleteLicense }) {
  const [deleting, setDeleting] = useState(false)
  const expiresDate =
    licenseInfo.expires == 'lifetime'
      ? t('Never')
      : t('{date, date, long}', { date: new Date(licenseInfo.expires) })

  let deleteModal = false
  if (deleting) {
    deleteModal = (
      <DeleteConfirmModal
        notSubmit
        customText={t('Are you sure you want to remove your license?')}
        onDelete={deleteLicense}
        onCancel={() => setDeleting(false)}
      />
    )
  }

  return (
    <div className="dashboard__user-info">
      <h1>{t('Account Information')}</h1>
      <div className="dashboard__user-info__wrapper">
        <dl className="dl-horizontal">
          <dt>{t('Purchase Email')}</dt>
          <dd>{licenseInfo.customer_email}</dd>
          <dt>{t('Device ID')}</dt>
          <dd>{deviceID}</dd>
        </dl>
        <dl className="dl-horizontal">
          <dt>{t('License Key')}</dt>
          <dd>{licenseInfo.licenseKey}</dd>
          <dt>{t('Expires')}</dt>
          <dd>{expiresDate}</dd>
        </dl>
      </div>
      <div className="text-right">
        <Button bsStyle="danger" bsSize="small" onClick={() => setDeleting(true)}>
          {t('Remove License')}
        </Button>
        {deleteModal}
        <p className="secondary-text">{t('Use this to remove your license on this device')}</p>
      </div>
    </div>
  )
}

UserInfo.propTypes = {
  licenseInfo: PropTypes.object,
  deleteLicense: PropTypes.func,
}
