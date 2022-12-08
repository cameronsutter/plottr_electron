import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import Button from '../../Button'
import DeleteConfirmModal from '../../dialogs/DeleteConfirmModal'
import { checkDependencies } from '../../checkDependencies'

const LicenseInfoConnector = (connector) => {
  const {
    platform: { machineIdSync, os },
  } = connector
  checkDependencies({ machineIdSync, os })

  const deviceID = machineIdSync(true)

  const LicenseInfo = ({
    expires,
    itemName,
    customerEmail,
    licenseKey,
    deleteLicense,
    settings,
  }) => {
    const [deleting, setDeleting] = useState(false)
    const expiresDate =
      expires == 'lifetime' ? t('Never') : t('{date, date, long}', { date: new Date(expires) })
    const usableDeviceID = os == 'unknown' ? t('Browser') : deviceID

    let deleteModal = false
    if (deleting) {
      deleteModal = (
        <DeleteConfirmModal
          notSubmit
          customText={t('Are you sure you want to deactivate your license key?')}
          onDelete={() => {
            deleteLicense().then(() => {
              setDeleting(false)
            })
          }}
          confirmText={t('Deactivate')}
          onCancel={() => setDeleting(false)}
        />
      )
    }

    const blurClass = settings.user.streamFriendly ? 'blurred' : ''

    return (
      <div className="dashboard__user-info">
        <div className="dashboard__user-info license-info__label">
          <h2>{t('License Information')}</h2>
          {os == 'unknown' ? null : (
            <div className="text-right">
              <Button bsStyle="danger" bsSize="small" onClick={() => setDeleting(true)}>
                {t('Deactivate License Key')}
              </Button>
              {deleteModal}
            </div>
          )}
        </div>
        <hr />
        <div className="dashboard__user-info__wrapper">
          <dl className="dl-horizontal">
            <dt>{t('Purchase Email')}</dt>
            <dd className={blurClass}>{customerEmail}</dd>
            <dt>{t('Product Name')}</dt>
            <dd>{itemName}</dd>
            <dt>{t('Device ID')}</dt>
            <dd className={blurClass}>{usableDeviceID}</dd>
          </dl>
          <dl className="dl-horizontal">
            <dt>{t('License Key')}</dt>
            <dd className={blurClass}>{licenseKey}</dd>
            <dt>{t('Expires')}</dt>
            <dd>{expiresDate}</dd>
          </dl>
        </div>
      </div>
    )
  }

  LicenseInfo.propTypes = {
    expires: PropTypes.number,
    itemName: PropTypes.string,
    customerEmail: PropTypes.string,
    licenseKey: PropTypes.string,
    settings: PropTypes.object,
    deleteLicense: PropTypes.func,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      expires: selectors.licenseExpiresSelector(state.present),
      itemName: selectors.licenseItemNameSelector(state.present),
      customerEmail: selectors.licenseCustomerEmailSelector(state.present),
      licenseKey: selectors.licenseKeySelector(state.present),
      settings: selectors.appSettingsSelector(state.present),
    }))(LicenseInfo)
  }

  return LicenseInfo
}

export default LicenseInfoConnector
