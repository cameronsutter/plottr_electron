import React from 'react'
import PropTypes from 'react-proptypes'
import { ProgressBar } from 'react-bootstrap'
import { t } from 'plottr_locales'

export default function OnboardingProgress({ currentStep, totalSteps }) {
  // const now = (currentStep / totalSteps) * 100

  const StepTitles = () => {
    let titles = []
    for (let i = 1; i <= totalSteps; i++) {
      titles.push(<div key={i}>{t('Step {number}', { number: i })}</div>)
    }
    return <div className="onboarding__progress__titles">{titles}</div>
  }

  return (
    <div className="onboarding__progress">
      <StepTitles />
      <ProgressBar now={currentStep} max={totalSteps} />
    </div>
  )
}

OnboardingProgress.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
}
