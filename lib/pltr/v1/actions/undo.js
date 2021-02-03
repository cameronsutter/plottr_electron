import { RESET } from '../constants/ActionTypes'

export function reset(payload) {
  return { type: RESET, data: payload }
}
