import {
  SET_HIERARCHY_LEVELS,
  EDIT_HIERARCHY_LEVEL,
  LOAD_HIERARCHY,
} from '../constants/ActionTypes'
import { currentTimelineSelector } from '../selectors'

export const setHierarchyLevels = (newHierarchyLevels) => (dispatch, getState) => {
  // NOTE: Mobile doesn't use history middleware
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const timeline = currentTimelineSelector(state)

  dispatch({
    type: SET_HIERARCHY_LEVELS,
    hierarchyLevels: newHierarchyLevels,
    timeline,
  })
}

export const editHierarchyLevel = (hierarchyLevel) => (dispatch, getState) => {
  // NOTE: Mobile doesn't use history middleware
  const fullState = getState()
  const state = fullState.present ? fullState.present : fullState
  const timeline = currentTimelineSelector(state)

  dispatch({
    type: EDIT_HIERARCHY_LEVEL,
    hierarchyLevel,
    timeline,
  })
}

export const load = (patching, hierarchy) => {
  return {
    type: LOAD_HIERARCHY,
    patching,
    hierarchy,
  }
}
