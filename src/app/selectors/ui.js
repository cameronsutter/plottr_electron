import { createSelector } from 'reselect'

export const currentTimelineSelector = state => state.ui.currentTimeline

export const isSeriesSelector = createSelector(
  currentTimelineSelector,
  (currentTimeline) => currentTimeline == 'series'
)
