const INITIAL_STATE = {}

const editorsReducer =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    if (action.editorMetadata) {
      const {
        editorMetadata: { selection, editorPath },
      } = action
      if (editorPath && selection) {
        return {
          ...state,
          [editorPath]: selection,
        }
      }
    }
    return state
  }

export default editorsReducer
