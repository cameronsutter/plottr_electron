import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Nav, NavItem } from 'react-bootstrap'
import { t } from 'plottr_locales'

import UnconnectedAbout from './About'
import UnconnectedAccount from './Account'
import UnconnectedProOnboarding from './proOnboarding/index'
import UnconnectedChoiceView from './ChoiceView'
import { checkDependencies } from '../../checkDependencies'

const AccountHomeConnector = (connector) => {
  const {
    platform: { mpq },
  } = connector
  checkDependencies({ mpq })

  const About = UnconnectedAbout(connector)
  const Account = UnconnectedAccount(connector)
  const ProOnboarding = UnconnectedProOnboarding(connector)
  const ChoiceView = UnconnectedChoiceView(connector)

  const viewsToHideNav = ['proOnboarding', 'choice']

  const AccountHome = ({ settings, isFirstTime }) => {
    const [view, setView] = useState(isFirstTime ? 'choice' : 'account')
    const [viewIsLocked, setLock] = useState(false)
    const isOnboardingDone = settings.isOnboardingDone

    useEffect(() => {
      setLock(view == 'proOnboarding')
    }, [view])

    useEffect(() => {
      // if (!isOnboardingDone && hasPro()) startOnboarding()
    }, [isOnboardingDone])

    const handleSelect = (selectedKey) => {
      if (viewIsLocked) return
      setView(selectedKey)
    }

    const startOnboarding = () => {
      setView('proOnboarding')
    }

    const cancelOnboarding = () => {
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
    settings: PropTypes.object.isRequired,
    isFirstTime: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        settings: selectors.appSettingsSelector(state.present),
        isFirstTime: selectors.isFirstTimeSelector(state.present),
      }),
      {}
    )(AccountHome)
  }

  throw new Error('Could not connect AccountHome')
}

export default AccountHomeConnector
