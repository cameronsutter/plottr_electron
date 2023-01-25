export const errorMessageSelector = (state) => state.error && state.error.error
export const partOfStoreWhereErrorOccured = (state) => state.error && state.error.storeKey
