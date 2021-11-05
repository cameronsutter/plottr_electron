import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Button } from 'react-bootstrap'
import { checkDependencies } from '../../checkDependencies'
import { Spinner } from '../../Spinner'

const ProInfoConnector = (connector) => {
  const {
    platform: {
      firebase: { logOut },
      license: { checkForPro },
    },
  } = connector
  checkDependencies({ logOut, checkForPro })

  const ProInfo = ({ licenseInfo, emailAddress, setUserId, setEmailAddress }) => {
    const [checking, setChecking] = useState(!licenseInfo)
    const [loggingOut, setLoggingOut] = useState(false)
    const [active, setActive] = useState(licenseInfo?.status == 'active')
    const [expiration, setExpiration] = useState(licenseInfo?.expiration)

    useEffect(() => {
      if (licenseInfo) return

      // TODO: check for admin first

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

    const handleLogOut = () => {
      setLoggingOut(true)
      logOut().then(() => {
        setLoggingOut(false)
        setUserId(null)
        setEmailAddress(null)
      })
    }

    if (checking) {
      return (
        <div>
          <Spinner /> <span>{t('Loading Pro Subscription')}...</span>
        </div>
      )
    }

    return (
      <div className="dashboard__user-info">
        <h2>{t('Pro Subscription')}</h2>
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
          <Button bsStyle="danger" bsSize="small" onClick={handleLogOut}>
            {t('Log Out')} {loggingOut ? <Spinner /> : null}
          </Button>
        </div>
      </div>
    )
  }

  ProInfo.propTypes = {
    licenseInfo: PropTypes.object,
    emailAddress: PropTypes.string,
    setUserId: PropTypes.func.isRequired,
    setEmailAddress: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        emailAddress: selectors.emailAddressSelector(state.present),
      }),
      {
        setUserId: actions.client.setUserId,
        setEmailAddress: actions.client.setEmailAddress,
      }
    )(ProInfo)
  }

  throw new Error('Could not connect ProInfo')
}

export default ProInfoConnector
