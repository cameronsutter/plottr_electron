import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Button } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedChoiceView from './ChoiceView'
import UnconnectedExpiredView from './ExpiredView'
import UnconnectedUserInfo from './UserInfo'
import UnconnectedAbout from './About'
import UnconnectedTrialInfo from './TrialInfo'
import UnconnectedProOnboarding from './proOnboarding/index'
import UnconnectedOptionsHome from '../options/OptionsHome'
import UnconnectedBackupsHome from '../backups/BackupsHome'
import { checkDependencies } from '../../checkDependencies'

const AccountConnector = (connector) => {
  const {
    platform: {
      license: { useTrialStatus, licenseStore, useLicenseInfo, hasPro },
      openExternal,
      os,
      mpq,
    },
  } = connector
  checkDependencies({ useTrialStatus, licenseStore, useLicenseInfo, hasPro, openExternal, os, mpq })

  const ChoiceView = UnconnectedChoiceView(connector)
  const ExpiredView = UnconnectedExpiredView(connector)
  const UserInfo = UnconnectedUserInfo(connector)
  const About = UnconnectedAbout(connector)
  const TrialInfo = UnconnectedTrialInfo(connector)
  const ProOnboarding = UnconnectedProOnboarding(connector)

  const Account = ({ darkMode, startProOnboarding, cancelProOnboarding }) => {
    const [showOnboarding, setShowOnboarding] = useState(false)
    const trialInfo = useTrialStatus()
    const [licenseInfo, licenseInfoSize] = useLicenseInfo()
    const firstTime = !licenseInfoSize && !trialInfo.started

    const isWebOrPro = false
    // const isWebOrPro = os == 'unknown' || hasPro

    // many possible states:
    // choices, trial, trial expired, license, Pro, license & Pro

    // const deleteLicense = () => {
    //   mpq.push('btn_remove_license_confirm')
    //   licenseStore.clear()
    // }

    // const renderUser = () => {
    //   // first time using the app
    //   if (firstTime) return <ChoiceView darkMode={props.darkMode} />

    //   // active license
    //   if (licenseInfoSize) {
    //     return (
    //       <UserInfo
    //         licenseInfo={licenseInfo}
    //         deleteLicense={deleteLicense}
    //         startPro={setShowOnboarding}
    //       />
    //     )
    //   }

    //   // free trial
    //   if (trialInfo.expired) {
    //     return <ExpiredView darkMode={props.darkMode} />
    //   } else {
    //     return <TrialInfo darkMode={props.darkMode} trialInfo={trialInfo} />
    //   }
    // }

    // const renderBelow = () => {
    //   if (firstTime) return null

    //   return (
    //     <>
    //       <hr />
    //       <About />
    //     </>
    //   )
    // }

    useEffect(() => {
      console.log('showOnboarding', showOnboarding)
    }, [showOnboarding])

    const startPro = () => {
      setShowOnboarding(true)
      startProOnboarding()
    }

    const cancelProStart = () => {
      setShowOnboarding(false)
      cancelProOnboarding()
    }

    const handleProClick = () => {
      openExternal('https://plottr.com/pricing')
    }

    const proLink = t.rich('Want Plottr Pro? Check out <a>Plottr Pricing</a>', {
      // eslint-disable-next-line react/display-name, react/prop-types
      a: ({ children }) => (
        <a href="#" onClick={handleProClick} key="pro-link">
          {children}
        </a>
      ),
    })

    if (showOnboarding) {
      return <ProOnboarding cancel={cancelProStart} />
    }

    return (
      <div className="dashboard__account">
        <h1>{t('Account')}</h1>
        {isWebOrPro ? null : (
          <div className="text-right">
            <Button onClick={startPro} bsSize="lg">
              {t('Start Plottr Pro')} 🎉
            </Button>
            <p className="secondary-text">{proLink}</p>
          </div>
        )}
      </div>
    )
  }

  Account.propTypes = {
    darkMode: PropTypes.bool,
    startProOnboarding: PropTypes.func,
    cancelProOnboarding: PropTypes.func,
  }

  return Account
}

export default AccountConnector
