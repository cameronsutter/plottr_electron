import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import ProgressBar from '../ProgressBar'

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
      <ProgressBar now={currentStep} max={totalSteps} />
      <StepTitles />
    </div>
  )
}

OnboardingProgress.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
}
