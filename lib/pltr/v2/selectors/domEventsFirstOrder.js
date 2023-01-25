import { createSelector } from 'reselect'

const domEventsSelector = (state) => {
  return state.domEvents
}

export const lastClickSelector = createSelector(domEventsSelector, ({ lastClick }) => {
  return lastClick
})
