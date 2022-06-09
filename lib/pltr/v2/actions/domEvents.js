import { CLICK_ON_DOM } from '../constants/ActionTypes'

export const clickOnDom = (x, y) => {
  return {
    type: CLICK_ON_DOM,
    x,
    y,
  }
}
