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
