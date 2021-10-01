import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  FormGroup,
  ControlLabel,
  Alert,
  FormControl,
  Jumbotron,
  PageHeader,
  Well,
} from 'react-bootstrap'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'

const ProStep0Connector = (connector) => {
  const {
    platform: {
      license: { useLicenseInfo, checkForPro },
    },
  } = connector

  const ProStep0 = ({ nextStep, cancel }) => {
    const [licenseInfo, _licenseInfoSize] = useLicenseInfo()
    const [checking, setChecking] = useState(true)
    const [tryingPurchaseEmail, setTryingPurchaseEmail] = useState(true)
    const [foundValidEmail, setValidEmail] = useState(false)
    const [emailValue, setEmail] = useState('')
    const emailInputRef = useRef(null)
    const [emailFailed, setEmailFailed] = useState(false)
    const [codeFailed, setCodeFailed] = useState(false)

    useEffect(() => {
      if (licenseInfo && licenseInfo.customer_email) {
        checkForPro(licenseInfo.customer_email, (hasPro) => {
          setChecking(false)
          setTryingPurchaseEmail(false)
          setValidEmail(hasPro)
        })
        // checkForPro('cameron@sharklasers.com', (hasPro) => {
        //   setChecking(false)
        //   setTryingPurchaseEmail(false)
        //   setValidEmail(hasPro)
        // })
      }
    }, [licenseInfo])

    const verifyEmail = () => {
      setEmailFailed(false)
      setChecking(true)
      console.log('emailValue', emailValue)
      checkForPro(emailValue, (hasPro) => {
        console.log('after request', emailValue)
        setChecking(false)
        if (hasPro) {
          setValidEmail(true)
        } else {
          setEmailFailed(true)
          setEmail('')
          emailInputRef.current.focus()
        }
      })
    }

    if (!foundValidEmail && !tryingPurchaseEmail) {
      return (
        <OnboardingStep>
          <StepHeader>
            <h3>{t('Verify Your Email')}</h3>
          </StepHeader>
          <StepBody>
            <FormGroup>
              <ControlLabel>{t('Email')}</ControlLabel>
              <FormControl
                type="text"
                value={emailValue}
                inputRef={(el) => (emailInputRef.current = el)}
                placeholder={t('The email address you used to purchase Plottr Pro')}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Button onClick={verifyEmail}>{t('Verify My Email')}</Button>
            </FormGroup>
            {checking ? <Spinner /> : null}
            {emailFailed ? (
              <Alert bsStyle="danger">
                <h4>{t("We couldn't find a Pro account with that email")}</h4>
              </Alert>
            ) : null}
          </StepBody>
          <StepFooter>
            <OnboardingButtonBar left>
              <Button onClick={cancel}>{t('Cancel')}</Button>
            </OnboardingButtonBar>
          </StepFooter>
        </OnboardingStep>
      )
    }

    if (checking) {
      return (
        <OnboardingStep>
          <StepBody>
            <Spinner />
          </StepBody>
        </OnboardingStep>
      )
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <h2>{t('You got Plottr Pro 🎉')}</h2>
          <p className="accented-text">{t("Let's get you onboarded")}</p>
        </StepHeader>
        <StepBody>
          <Jumbotron>
            <p className="accented-text">
              {t("This will be quick and painless. There's only 3 steps:")}
            </p>
            <ol>
              <li>{t('Sign in')}</li>
              <li>{t('Upload projects and templates to the cloud')}</li>
              <li>{t('A few easy settings')}</li>
            </ol>
          </Jumbotron>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar>
            <Button bsSize="large" onClick={cancel}>
              {t('Not Now')}
            </Button>
            <Button bsSize="large" onClick={nextStep}>
              {t('Go!')}
            </Button>
          </OnboardingButtonBar>
        </StepFooter>
      </OnboardingStep>
    )
  }

  ProStep0.propTypes = {
    nextStep: PropTypes.func,
    cancel: PropTypes.func,
  }

  return ProStep0
}

export default ProStep0Connector
