// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

const domEventsSelector = (state) => {
  return state.domEvents
}

export const lastClickSelector = createSelector(domEventsSelector, ({ lastClick }) => {
  return lastClick
})

export const droppedBeatSelector = createSelector(domEventsSelector, ({ droppedBeat }) => {
  return droppedBeat
})
