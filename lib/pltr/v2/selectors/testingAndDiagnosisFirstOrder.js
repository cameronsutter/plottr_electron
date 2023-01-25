// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

const testingAndDiagnosisSelector = ({ testingAndDiagnosis }) => {
  return testingAndDiagnosis
}

export const testingAndDiagnosisEnabledSelector = createSelector(
  testingAndDiagnosisSelector,
  ({ testingAndDiagnosisEnabled }) => {
    return testingAndDiagnosisEnabled
  }
)
