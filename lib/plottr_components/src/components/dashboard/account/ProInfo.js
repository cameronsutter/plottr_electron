import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Button } from 'react-bootstrap'
import { checkDependencies } from '../../checkDependencies'
import { Spinner } from '../../Spinner'

const ProInfoConnector = (connector) => {
  const {
    platform: {
      firebase: { logOut, currentUser },
      settings: { saveAppSetting },
    },
  } = connector
  checkDependencies({ logOut, saveAppSetting, currentUser })

  const ProInfo = ({
    emailAddress,
    setHasPro,
    setUserId,
    setEmailAddress,
    resetProLicenseInfo,
    admin,
    active,
    expiration,
    settings,
  }) => {
    const [loggingOut, setLoggingOut] = useState(false)

    const expiresDate = () => {
      if (!expiration) return null
      return expiration == 'lifetime'
        ? t('Never')
        : t('{date, date, long}', { date: new Date(expiration) })
    }

    const handleLogOut = () => {
      setLoggingOut(true)
      logOut().then(() => {
        // the order of these might matter
        saveAppSetting('user.frbId', null)
        resetProLicenseInfo()
        setLoggingOut(false)
        // Ordering is significant!  If you set has pro to false
        // before nuking the email address and user id then it might
        // re-launch the check for whether we have pro or not.
        setUserId(null)
        setEmailAddress(null)
        setHasPro(false)
      })
    }

    const blurClass = settings.user.streamFriendly ? 'blurred' : ''

    return (
      <div className="dashboard__user-info">
        <h2>{t('Pro Subscription')}</h2>
        <hr />
        <div className="dashboard__user-info__wrapper">
          <dl className="dl-horizontal">
            <dt>{t('Purchase Email')}</dt>
            <dd className={blurClass}>{emailAddress}</dd>
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
      </div>
    )
  }

  ProInfo.propTypes = {
    licenseInfo: PropTypes.object,
    emailAddress: PropTypes.string,
    admin: PropTypes.bool,
    active: PropTypes.bool,
    expiration: PropTypes.string,
    settings: PropTypes.object,
    setHasPro: PropTypes.func.isRequired,
    setUserId: PropTypes.func.isRequired,
    setEmailAddress: PropTypes.func.isRequired,
    resetProLicenseInfo: PropTypes.func.isRequired,
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
        admin: selectors.proLicenseAdminSelector(state.present),
        active: selectors.hasProSelector(state.present),
        expiration: selectors.proLicenseExpirationSelector(state.present),
        settings: selectors.appSettingsSelector(state.present),
      }),
      {
        setHasPro: actions.client.setHasPro,
        setUserId: actions.client.setUserId,
        setEmailAddress: actions.client.setEmailAddress,
        resetProLicenseInfo: actions.license.resetProLicenseInfo,
      }
    )(ProInfo)
  }

  throw new Error('Could not connect ProInfo')
}

export default ProInfoConnector
