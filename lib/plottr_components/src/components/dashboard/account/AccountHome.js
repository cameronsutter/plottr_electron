import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import UnconnectedAccount from './Account'
import UnconnectedProOnboarding from './proOnboarding/index'
import UnconnectedChoiceView from './ChoiceView'
import { checkDependencies } from '../../checkDependencies'

const AccountHomeConnector = (connector) => {
  const {
    platform: { mpq },
  } = connector
  checkDependencies({ mpq })

  const Account = UnconnectedAccount(connector)
  const ProOnboarding = UnconnectedProOnboarding(connector)
  const ChoiceView = UnconnectedChoiceView(connector)

  const AccountHome = ({ isFirstTime, isOnboarding, startProOnboarding, finishProOnboarding }) => {
    const [view, setView] = useState(
      isOnboarding ? 'proOnboarding' : isFirstTime ? 'choice' : 'account'
    )

    const startOnboarding = () => {
      startProOnboarding()
      setView('proOnboarding')
    }

    const cancelOnboarding = () => {
      finishProOnboarding()
      setView('account')
    }

    let body
    switch (view) {
      case 'choice':
        body = <ChoiceView goToAccount={() => setView('account')} />
        break
      case 'proOnboarding':
        body = <ProOnboarding cancel={cancelOnboarding} />
        break
      case 'account':
        body = <Account startProOnboarding={startOnboarding} />
        break
    }

    return <div className="dashboard__account">{body}</div>
  }

  AccountHome.propTypes = {
    isFirstTime: PropTypes.bool,
    isOnboarding: PropTypes.bool,
    startProOnboarding: PropTypes.func.isRequired,
    finishProOnboarding: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        isFirstTime: selectors.isFirstTimeSelector(state.present),
        isOnboarding: selectors.isOnboardingToProSelector(state.present),
      }),
      {
        startProOnboarding: actions.applicationState.startProOnboarding,
        finishProOnboarding: actions.applicationState.finishProOnboarding,
      }
    )(AccountHome)
  }

  throw new Error('Could not connect AccountHome')
}

export default AccountHomeConnector
