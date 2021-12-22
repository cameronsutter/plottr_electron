import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { t } from 'plottr_locales'
import UnconnectedVerifyView from './VerifyView'
import UnconnectedVerifyPro from './VerifyPro'
import { checkDependencies } from '../../checkDependencies'

const ExpiredViewConnector = (connector) => {
  const VerifyView = UnconnectedVerifyView(connector)
  const VerifyPro = UnconnectedVerifyPro(connector)

  const {
    platform: { openExternal },
  } = connector
  checkDependencies({ openExternal })

  const ExpiredView = ({ darkMode }) => {
    const [view, setView] = useState('chooser')

    const buy = () => {
      openExternal('https://plottr.com/pricing/')
    }

    const renderChoices = () => {
      // eslint-disable-next-line react/display-name, react/prop-types
      const licenseText = t.rich('I have a<br/>License Key', { br: () => <br /> })

      return (
        <>
          <p style={{ padding: '5px 70px' }}>
            {t("Don't worry, all your work is saved in your files")}
          </p>
          <div className="expired__chooser" style={{ marginBottom: '20px' }}>
            <div className="expired__choice" onClick={buy}>
              <h2>{t('I want to buy the full version!')}</h2>
            </div>
            <div className="expired__choice" onClick={() => setView('verify')}>
              <h2>{licenseText}</h2>
            </div>
            <div className="expired__choice" onClick={() => setView('pro')}>
              <h2>{t('I have Plottr Pro')}</h2>
            </div>
          </div>
        </>
      )
    }

    if (view == 'chooser') {
      return (
        <div className="text-center">
          <h1 className="expired">{t('Thanks for trying Plottr')}</h1>
          <h2>{t('Your free trial has expired')} 😭</h2>
          {renderChoices()}
          <p>{t('Please contact me with any questions at support@plottr.com')}</p>
        </div>
      )
    } else if (view == 'verify') {
      return <VerifyView darkMode={darkMode} goBack={() => setView('chooser')} />
    } else if (view == 'pro') {
      return <VerifyPro goBack={() => setView('chooser')} success={() => {}} />
    }
    // Better than undefined! :P
    return null
  }

  ExpiredView.propTypes = {
    darkMode: PropTypes.bool,
  }

  return ExpiredView
}

export default ExpiredViewConnector
