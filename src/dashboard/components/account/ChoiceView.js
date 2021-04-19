import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Button } from 'react-bootstrap'
import { t } from 'plottr_locales'
import VerifyView from './VerifyView'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import AccountHeader from './AccountHeader'

export default function ChoiceView(props) {
  const { startTrial } = useTrialStatus()
  const [view, setView] = useState('chooser')

  const renderBody = () => {
    switch (view) {
      case 'chooser':
        return (
          <div className="verify__chooser">
            <div className="verify__choice" onClick={() => setView('explain')}>
              <h2>{t('I want to start the free trial')}</h2>
            </div>
            <div className="verify__choice" onClick={() => setView('verify')}>
              <h2>{t('I have a license key')}</h2>
            </div>
          </div>
        )
      case 'verify':
        return <VerifyView darkMode={props.darkMode} goBack={() => setView('chooser')} />
      case 'explain':
        return (
          <div>
            <p>{t("You'll have 30 days")}</p>
            <p>{t('Access to all the features')}</p>
            <p>{t('Create unlimited project files')}</p>
            <div style={{ marginTop: '30px' }}>
              <Button bsSize="large" bsStyle="default" onClick={startTrial}>
                {t('Start my Free Trial')}
              </Button>
              <Button bsStyle="link" onClick={() => setView('chooser')}>
                {t('Cancel')}
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="text-center">
      <AccountHeader />
      {renderBody()}
    </div>
  )
}

ChoiceView.propTypes = {
  darkMode: PropTypes.bool,
}
