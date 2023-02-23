// Keeping in case we need it later
// eslint-disable-next-line react/display-name,no-unused-vars
const gatedBy = (featureFlagName) => (featureFlags) => (thunk) => {
  if (featureFlags[featureFlagName]) {
    return thunk()
  }
  return null
}
