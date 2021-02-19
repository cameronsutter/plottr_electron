import {
  ADD_HIERARCHY_LEVEL,
  ASSIGN_BEAT_TO_HIERARCHY,
  DELETE_HIERARCHY_LEVEL,
} from '../constants/ActionTypes'

// Beat id should be computed by the root reducer
export const addHierarchyLevel = (bookId, beatId) => ({
  type: ADD_HIERARCHY_LEVEL,
  bookId,
  beatId,
})

// Beat ids should be computed by the root reducer
export const deleteHierarchyLevel = (bookId, level, beatIds) => ({
  type: DELETE_HIERARCHY_LEVEL,
  bookId,
  level,
  beatIds,
})

export const assignBeatToHierarchy = () => ({
  type: ASSIGN_BEAT_TO_HIERARCHY,
})
