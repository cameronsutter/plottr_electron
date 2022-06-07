import { ENABLE_TEST_UTILITIES } from '../constants/ActionTypes'

const INITIAL_STATE = {
  testingAndDiagnosisEnabled: false,
}

const testingAndDiagnosis = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ENABLE_TEST_UTILITIES: {
      return {
        ...state,
        testingAndDiagnosisEnabled: true,
      }
    }
    default: {
      return state
    }
  }
}

export default testingAndDiagnosis
