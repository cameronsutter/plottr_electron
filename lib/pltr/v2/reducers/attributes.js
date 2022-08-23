import { CREATE_CHARACTER_ATTRIBUTE } from '../constants/ActionTypes'

const INITIAL_STATE = []

const attributesReducer =
  (dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case CREATE_CHARACTER_ATTRIBUTE: {
        return [...state, { ...action.attribute, id: action.newAttributeId }]
      }

      default: {
        return state
      }
    }
  }

export default attributesReducer
