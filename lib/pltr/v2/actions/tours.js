import {
  SET_TOUR_FEATURE,
  TOUR_NEXT,
  TOUR_RESTART,
  TOUR_PREVIOUS,
  RESET_ADVANCE_SOURCE,
  SET_STEP,
} from '../constants/ActionTypes'

export function setTourFeature(feature) {
  return {
    type: SET_TOUR_FEATURE,
    feature,
  }
}

export function tourNext(feature, source, appInteractionAdvanced = true, resetIfMismatch) {
  return {
    type: TOUR_NEXT,
    feature,
    source,
    appInteractionAdvanced,
    resetIfMismatch,
  }
}

export function tourPrevious(feature, source, appInteractionAdvanced = true, resetIfMismatch) {
  return {
    type: TOUR_PREVIOUS,
    feature,
    source,
    appInteractionAdvanced,
    resetIfMismatch,
  }
}

export function resetAdvanceSource() {
  return { type: RESET_ADVANCE_SOURCE }
}

export function tourRestart() {
  return {
    type: TOUR_RESTART,
  }
}

export function setStep(overridenStepIndex) {
  return {
    type: SET_STEP,
    overridenStepIndex,
  }
}
