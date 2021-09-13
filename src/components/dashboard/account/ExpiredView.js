import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { t as i18n } from 'plottr_locales'
import UnconnectedAdView from './AdView'
import UnconnectedVerifyView from './VerifyView'
import { checkDependencies } from '../../checkDependencies'

const ExpiredViewConnector = (connector) => {
  const AdView = UnconnectedAdView(connector)
  const VerifyView = UnconnectedVerifyView(connector)

  const {
    platform: {
      license: { useTrialStatus },
      openExternal,
    },
  } = connector
  checkDependencies({ useTrialStatus, openExternal })

  const ExpiredView = (props) => {
    const { canExtend, extendTrial } = useTrialStatus()
    const [view, setView] = useState('chooser')

    const buy = () => {
      openExternal('https://plottr.com/pricing/')
    }

    const extend = () => {
      extendTrial(5)
    }

    const renderChoices = () => {
      if (canExtend) {
        return (
          <>
            <p style={{ padding: '5px 70px' }}>
              {i18n("Don't worry, all your work is saved in your files")}
            </p>
            <div className="expired__chooser">
              <div className="expired__choice" onClick={() => setView('verify')}>
                <h2>{i18n('I have a license key')}</h2>
              </div>
              <div className="expired__choice" onClick={() => setView('ad')}>
                <h2>{i18n('Can I have a few more days?')}</h2>
              </div>
            </div>
          </>
        )
      } else {
        // return <div style={{margin: '35px', marginTop: '20px'}}>
        //   <h3><a href='#' onClick={this.buy}>{i18n('Get the full version')}</a>{' '}<a href='#' onClick={this.verify}>{i18n('Or verify your license')}</a></h3>
        //   <p></p>
        //   <p style={{padding: '10px 70px'}}>{i18n('Don\'t worry, all your work is saved in plottr_trial.pltr in your Documents folder')}</p>
        // </div>
        return (
          <>
            <p style={{ padding: '5px 70px' }}>
              {i18n(
                "Don't worry, all your work is saved in plottr_trial.pltr in your Documents folder"
              )}
            </p>
            <div className="expired__chooser" style={{ marginBottom: '20px' }}>
              <div className="expired__choice" onClick={buy}>
                <h2>{i18n('I want to buy the full version!')}</h2>
              </div>
              <div className="expired__choice" onClick={() => setView('verify')}>
                <h2>{i18n('I have a license key')}</h2>
              </div>
            </div>
          </>
        )
      }
    }

    if (view == 'chooser') {
      return (
        <div className="text-center">
          <h1 className="expired">{i18n('Thanks for trying Plottr')}</h1>
          <h2>{i18n('Your free trial has expired')} 😭</h2>
          {renderChoices()}
          <p>{i18n('Please contact me with any questions at support@plottr.com')}</p>
        </div>
      )
    } else if (view == 'ad') {
      return <AdView extendTrial={extend} />
    } else if (view == 'verify') {
      return <VerifyView darkMode={props.darkMode} goBack={() => setView('chooser')} />
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
