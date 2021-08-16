import { RECORD_LAST_ACTION, RESET_ACTION_RECORDER } from '../constants/ActionTypes'

const INITIAL_STATE = {
  editCount: 0,
  lastAction: null,
  lastActionKeys: [],
  startTimestamp: null,
  lastActionTimestamp: null,
}

const actionsReducer = (state = INITIAL_STATE, action) => {
  if (action.type === RESET_ACTION_RECORDER) return INITIAL_STATE

  if (action.type !== RECORD_LAST_ACTION) return state

  const { lastAction, lastActionKeys, lastActionTimestamp } = action
  return {
    editCount: state.editCount + 1,
    startTimestamp: state.startTimestamp || lastActionTimestamp,
    lastAction,
    lastActionKeys,
    lastActionTimestamp,
  }
}

export default actionsReducer
