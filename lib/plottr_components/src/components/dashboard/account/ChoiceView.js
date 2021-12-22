import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Button } from 'react-bootstrap'
import { t } from 'plottr_locales'
import UnconnectedVerifyView from './VerifyView'
import UnconnectedVerifyPro from './VerifyPro'
import AccountHeader from './AccountHeader'
import { checkDependencies } from '../../checkDependencies'

const ChoiceViewConnector = (connector) => {
  const {
    platform: {
      license: { useTrialStatus },
      os,
    },
  } = connector
  checkDependencies({ useTrialStatus })

  const VerifyView = UnconnectedVerifyView(connector)
  const VerifyPro = UnconnectedVerifyPro(connector)

  const ChoiceView = ({ darkMode, goToAccount }) => {
    const { startTrial } = useTrialStatus()
    const [view, setView] = useState('chooser')

    const goBack = () => setView('chooser')

    // eslint-disable-next-line react/display-name, react/prop-types
    const trialText = t.rich('Start the<br/>Free Trial', { br: () => <br /> })
    // eslint-disable-next-line react/display-name, react/prop-types
    const licenseText = t.rich('I have a<br/>License Key', { br: () => <br /> })

    const renderBody = () => {
      switch (view) {
        case 'chooser':
          return (
            <div className="verify__chooser with-3">
              <div className="verify__choice" onClick={() => setView('explain')}>
                <h2>{trialText}</h2>
              </div>
              <div className="verify__choice" onClick={() => setView('verify')}>
                <h2>{licenseText}</h2>
              </div>
              <div className="verify__choice" onClick={() => setView('pro')}>
                <h2>{t('I have Plottr Pro')}</h2>
              </div>
            </div>
          )
        case 'verify':
          return <VerifyView darkMode={darkMode} goBack={goBack} success={goToAccount} />
        case 'explain':
          return (
            <div>
              <p>{t("You'll have 30 days")}</p>
              <p>{t('Access all the features')}</p>
              <p>{t('Create unlimited projects')}</p>
              <div style={{ marginTop: '30px' }}>
                <Button
                  bsSize="large"
                  bsStyle="default"
                  onClick={() => {
                    startTrial()
                    goToAccount()
                  }}
                >
                  {t('Start my Free Trial')}
                </Button>
                <Button bsStyle="link" onClick={goBack}>
                  {t('Cancel')}
                </Button>
              </div>
            </div>
          )
        case 'pro':
          return <VerifyPro goBack={goBack} success={goToAccount} />
      }
      return null
    }

    return (
      <div className="text-center">
        <AccountHeader os={os} />
        {renderBody()}
      </div>
    )
  }

  ChoiceView.propTypes = {
    goToAccount: PropTypes.func.isRequired,
    darkMode: PropTypes.bool,
  }

  return ChoiceView
}

export default ChoiceViewConnector
