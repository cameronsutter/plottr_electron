// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

export const errorMessageSelector = (state) => state.error && state.error.error
export const partOfStoreWhereErrorOccured = (state) => state.error && state.error.storeKey
