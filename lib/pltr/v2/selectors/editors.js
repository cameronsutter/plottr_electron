export const selectionSelector = (state, path) =>
  state.editors[path] || { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } }
