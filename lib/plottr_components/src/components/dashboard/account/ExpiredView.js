import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { Button } from 'react-bootstrap'

import { t } from 'plottr_locales'

import UnconnectedVerifyView from './VerifyView'
import { checkDependencies } from '../../checkDependencies'

const ExpiredViewConnector = (connector) => {
  const VerifyView = UnconnectedVerifyView(connector)

  const {
    platform: {
      license: { extendTrial },
      openExternal,
      os,
    },
  } = connector
  checkDependencies({ extendTrial, openExternal })

  const ExpiredView = ({ canExtend, startProOnboardingFromRoot }) => {
    const [view, setView] = useState('chooser')

    const hideProButton = os() == 'unknown'

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
          </div>
        </>
      )
    }

    if (view === 'chooser') {
      return (
        <div className="text-center">
          <h1 className="expired">{t('Thanks for trying Plottr')}</h1>
          {hideProButton ? null : (
            <div className="text-right">
              <Button onClick={startProOnboardingFromRoot}>{t('Start Plottr Pro')} 🎉</Button>
            </div>
          )}
          <h2>{t('Your free trial has expired')} 😭</h2>
          {renderChoices()}
          <p>{t('Please contact me with any questions at support@plottr.com')}</p>
        </div>
      )
    } else if (view === 'verify') {
      return (
        <VerifyView
          goBack={() => setView('chooser')}
          success={() => {
            window.location.reload()
          }}
        />
      )
    }
    // Better than undefined! :P
    return null
  }

  ExpiredView.propTypes = {
    canExtend: PropTypes.bool,
    startProOnboardingFromRoot: PropTypes.func.isRequired,
  }

  const {
    pltr: { selectors, actions },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        canExtend: selectors.canExtendSelector(state.present),
      }),
      {
        startProOnboardingFromRoot: actions.applicationState.startProOnboardingFromRoot,
      }
    )(ExpiredView)
  }

  throw new Error('Could not connect ExpiredView')
}

export default ExpiredViewConnector
