import { CLICK_ON_DOM, COLLECT_BEAT, DROP_BEAT } from '../constants/ActionTypes'

export const clickOnDom = (x, y) => {
  return {
    type: CLICK_ON_DOM,
    x,
    y,
  }
}

export function dropBeat(beatId, coord) {
  return { type: DROP_BEAT, id: beatId, coord }
}

export function collectBeat() {
  return { type: COLLECT_BEAT }
}
