import { createSelector } from 'reselect'

export const currentTimelineSelector = state => state.ui.currentTimeline
export const characterFilterSelector = state => state.ui.characterFilter
export const characterSortSelector = state => state.ui.characterSort

export const isSeriesSelector = createSelector(
  currentTimelineSelector,
  (currentTimeline) => currentTimeline == 'series'
)
