import React from 'react'
import { t } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const BetaInfoConnector = (connector) => {
  const {
    platform: { useProLicenseInfo },
  } = connector
  checkDependencies({ useProLicenseInfo })

  const BetaInfo = () => {
    const [betaInfo] = useProLicenseInfo()

    const active = !!betaInfo?.claims?.beta
    const admin = !!betaInfo?.claims?.admin

    return (
      <div className="dashboard__user-info">
        <h2>{t('Beta Information')}</h2>
        <hr />
        <div className="dashboard__user-info__wrapper">
          <dl className="dl-horizontal">
            <dt>{t('Beta Email')}</dt>
            <dd>{betaInfo.customer_email}</dd>
            {admin ? (
              <>
                <dt>{t('Admin')}</dt>
                <dd>YES</dd>
              </>
            ) : null}
          </dl>
          <dl className="dl-horizontal">
            <dt>{t('Status')}</dt>
            <dd>{active ? t('Active') : t('Not Active')}</dd>
          </dl>
        </div>
      </div>
    )
  }

  return BetaInfo
}

export default BetaInfoConnector
