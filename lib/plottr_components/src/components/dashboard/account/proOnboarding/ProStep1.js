import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Alert } from 'react-bootstrap'

import { t } from 'plottr_locales'

import Button from '../../../Button'
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

  const ProStep1 = ({
    nextStep,
    cancel,
    hasCurrentProLicense,
    checkedProSubscription,
    checkingProSubscription,
    startLoadingALicenseType,
    finishLoadingALicenseType,
  }) => {
    const noPro = checkedProSubscription && !hasCurrentProLicense
    const showFrb = !hasCurrentProLicense

    useEffect(() => {
      if (!checkedProSubscription) return

      if (hasCurrentProLicense) {
        nextStep()
      }
    }, [checkedProSubscription, hasCurrentProLicense])

    const toggleChecking = (newVal) => {
      if (newVal) {
        // started checking
        startLoadingALicenseType('proSubscription')
      } else {
        if (checkedProSubscription) return
        // finished checking
        finishLoadingALicenseType('proSubscription')
      }
    }

    const cancelAndLogout = () => {
      logOut().then(() => cancel())
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <h2>{t('Sign in with your my.plottr.com account')}</h2>
          {checkingProSubscription ? <Spinner /> : null}
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
        {noPro || checkingProSubscription ? null : (
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
    checkingProSubscription: PropTypes.bool,
    checkedProSubscription: PropTypes.bool,
    startLoadingALicenseType: PropTypes.func.isRequired,
    finishLoadingALicenseType: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        hasCurrentProLicense: selectors.hasProSelector(state.present),
        checkingProSubscription: selectors.checkingProSubscriptionSelector(state.present),
        checkedProSubscription: selectors.checkedProSubscriptionSelector(state.present),
      }),
      {
        startLoadingALicenseType: actions.applicationState.startLoadingALicenseType,
        finishLoadingALicenseType: actions.applicationState.finishLoadingALicenseType,
      }
    )(ProStep1)
  }

  throw new Error('Could not connect ProStep1')
}

export default ProStep1Connector
