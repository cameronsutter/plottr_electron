import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { Alert, Button } from 'react-bootstrap'

import { t } from 'plottr_locales'

import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'
import UnconnectedFirebaseLogin from '../../../FirebaseLogin'
import { checkDependencies } from '../../../checkDependencies'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'

const ProStep1Connector = (connector) => {
  const {
    platform: {
      isDevelopment,
      firebase: { logOut },
    },
  } = connector
  checkDependencies({ isDevelopment })

  const FirebaseLogin = UnconnectedFirebaseLogin(connector)

  const ProStep1 = ({ nextStep, cancel, hasCurrentProLicense }) => {
    const [checking, setChecking] = useState(false)
    const [hasChecked, setHasChecked] = useState(false)
    const [noPro, setNoPro] = useState(false)

    useEffect(() => {
      if (!hasChecked) return

      if (hasCurrentProLicense) {
        nextStep()
      } else {
        setNoPro(true)
      }
    }, [hasChecked, hasCurrentProLicense])

    const toggleChecking = (newVal) => {
      if (newVal) {
        // started checking
        setChecking(true)
      } else {
        if (hasChecked) return
        // finished checking
        setChecking(false)
        setHasChecked(true)
      }
    }

    const cancelAndLogout = () => {
      logOut().then(() => cancel())
    }

    const showFrb = !hasCurrentProLicense || isDevelopment

    return (
      <OnboardingStep>
        <StepHeader>
          <h2>{t('Sign in with your my.plottr.com account')}</h2>
          {checking ? <Spinner /> : null}
        </StepHeader>
        {noPro ? (
          <StepBody>
            <Alert bsStyle="danger">
              <h4>{t("We couldn't find a Pro account with that email")}</h4>
            </Alert>
            <Button onClick={cancelAndLogout} bsSize="sm">
              {t('Cancel')}
            </Button>
          </StepBody>
        ) : null}
        <StepBody>{showFrb ? <FirebaseLogin setChecking={toggleChecking} /> : null}</StepBody>
        {noPro || checking ? null : (
          <StepFooter>
            <OnboardingButtonBar>
              <Button onClick={cancelAndLogout}>{t('Cancel')}</Button>
            </OnboardingButtonBar>
          </StepFooter>
        )}
      </OnboardingStep>
    )
  }

  ProStep1.propTypes = {
    nextStep: PropTypes.func,
    cancel: PropTypes.func,
    hasCurrentProLicense: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      hasCurrentProLicense: selectors.hasProSelector(state.present),
    }))(ProStep1)
  }

  throw new Error('Could not connect ProStep1')
}

export default ProStep1Connector
