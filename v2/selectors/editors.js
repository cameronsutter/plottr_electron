export const selectionSelector = (state, path) =>
  state.editors[path] || { anchor: null, focus: null }
