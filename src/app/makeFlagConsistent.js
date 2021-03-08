export const dispatchingToStore = (dispatch) => (action) => {
  dispatch(action())
}

export const makeFlagConsistent = (state, flagSettingsValue, flagName, setFlag, unsetFlag) => {
  if (!state.featureFlags && flagSettingsValue) {
    setFlag()
  } else if (!state.featureFlags && !flagSettingsValue) {
    unsetFlag()
  } else if (!state.featureFlags[flagName] && flagSettingsValue) {
    setFlag()
  } else if (state.featureFlags[flagName] && !flagSettingsValue) {
    unsetFlag()
  }
}
