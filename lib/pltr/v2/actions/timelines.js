import {
  ADD_HIERARCHY_LEVEL,
  ASSIGN_BEAT_TO_HIERARCHY,
  DELETE_HIERARCHY_LEVEL,
} from '../constants/ActionTypes'

export const addHierarchyLevel = (bookId, beatId) => ({
  type: ADD_HIERARCHY_LEVEL,
  bookId,
  beatId,
})

export const deleteHierarchyLevel = () => ({
  type: DELETE_HIERARCHY_LEVEL,
})

export const assignBeatToHierarchy = () => ({
  type: ASSIGN_BEAT_TO_HIERARCHY,
})
