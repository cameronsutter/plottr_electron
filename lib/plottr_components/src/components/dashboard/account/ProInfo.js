import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Button } from 'react-bootstrap'
import { checkDependencies } from '../../checkDependencies'
import { checkForPro } from '../../../../../../src/common/licensing/check_pro'
import { Spinner } from '../../Spinner'

const ProInfoConnector = (connector) => {
  const {
    platform: {
      firebase: { logOut },
    },
  } = connector
  checkDependencies({ logOut })

  const ProInfo = ({ licenseInfo, emailAddress }) => {
    const [checking, setChecking] = useState(!licenseInfo)
    const [active, setActive] = useState(licenseInfo?.status == 'active')
    const [expiration, setExpiration] = useState(licenseInfo?.expiration)

    useEffect(() => {
      if (licenseInfo) return

      setChecking(true)
      checkForPro(emailAddress, (hasPro, info) => {
        setChecking(false)
        if (hasPro && info) {
          setActive(true)
          setExpiration(info.expiration)
        } else {
          setActive(false)
        }
      })
    }, [licenseInfo, emailAddress])

    const expiresDate = () => {
      if (!expiration) return null
      return expiration == 'lifetime'
        ? t('Never')
        : t('{date, date, long}', { date: new Date(expiration) })
    }

    if (checking) return <Spinner />

    return (
      <div className="dashboard__user-info">
        <h2>{t('Plottr Pro Information')}</h2>
        <hr />
        <div className="dashboard__user-info__wrapper">
          <dl className="dl-horizontal">
            <dt>{t('Purchase Email')}</dt>
            <dd>{emailAddress}</dd>
          </dl>
          <dl className="dl-horizontal">
            <dt>{t('Status')}</dt>
            <dd>{active ? t('Active') : t('Not Active')}</dd>
            <dt>{t('Expires')}</dt>
            <dd>{expiresDate()}</dd>
          </dl>
        </div>
        <div className="text-right">
          <Button bsStyle="danger" bsSize="small" onClick={logOut}>
            {t('Log Out')}
          </Button>
        </div>
      </div>
    )
  }

  ProInfo.propTypes = {
    licenseInfo: PropTypes.object,
    emailAddress: PropTypes.string,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      emailAddress: selectors.emailAddressSelector(state.present),
    }))(ProInfo)
  }

  throw new Error('Could not connect ProInfo')
}

export default ProInfoConnector
