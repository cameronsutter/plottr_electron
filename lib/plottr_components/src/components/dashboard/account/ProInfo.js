import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Button } from 'react-bootstrap'
import { checkDependencies } from '../../checkDependencies'
import { Spinner } from '../../Spinner'

const ProInfoConnector = (connector) => {
  const {
    platform: {
      firebase: { logOut, currentUser },
      license: { checkForPro },
      settings,
    },
  } = connector
  checkDependencies({ logOut, checkForPro, settings })

  const ProInfo = ({
    emailAddress,
    setUserId,
    setEmailAddress,
    setHasPro,
    hasCurrentProLicense,
  }) => {
    const [checking, setChecking] = useState(true)
    const [loggingOut, setLoggingOut] = useState(false)
    const [active, setActive] = useState(false)
    const [expiration, setExpiration] = useState(null)
    const [admin, setAdmin] = useState(false)

    useEffect(() => {
      if (!emailAddress) return
      if (!hasCurrentProLicense) return

      setChecking(true)
      currentUser()
        .getIdTokenResult()
        .then((token) => {
          if (token.claims.admin) {
            setChecking(false)
            setActive(true)
            setExpiration('lifetime')
            setAdmin(true)
          } else {
            checkForPro(emailAddress, (hasPro, info) => {
              setChecking(false)
              if (hasPro && info) {
                setActive(true)
                setExpiration(info.expiration)
              } else {
                setActive(false)
              }
            })
          }
        })
    }, [emailAddress, hasCurrentProLicense])

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

    const handleExit = () => {
      setLoggingOut(true)
      logOut().then(() => {
        setLoggingOut(false)
        setHasPro(false)
        setUserId(null)
        setEmailAddress(null)
        settings.set('user.frbId', null)
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
            {admin ? (
              <>
                <dt>Admin</dt>
                <dd>woohoo</dd>
              </>
            ) : null}
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
        <div className="text-left">
          <Button bsStyle="danger" bsSize="small" onClick={handleExit}>
            {t('Remove Pro on this Device')} {loggingOut ? <Spinner /> : null}
          </Button>
          <p className="secondary-text">{t('Use this if you logged into Pro by accident')}</p>
        </div>
      </div>
    )
  }

  ProInfo.propTypes = {
    licenseInfo: PropTypes.object,
    emailAddress: PropTypes.string,
    setUserId: PropTypes.func.isRequired,
    setEmailAddress: PropTypes.func.isRequired,
    setHasPro: PropTypes.func.isRequired,
    hasCurrentProLicense: PropTypes.bool,
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
        hasCurrentProLicense: selectors.hasProSelector(state.present),
      }),
      {
        setUserId: actions.client.setUserId,
        setEmailAddress: actions.client.setEmailAddress,
        setHasPro: actions.client.setHasPro,
      }
    )(ProInfo)
  }

  throw new Error('Could not connect ProInfo')
}

export default ProInfoConnector
