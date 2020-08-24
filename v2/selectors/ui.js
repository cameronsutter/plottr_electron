import { createSelector } from 'reselect'

export const currentTimelineSelector = state => state.ui.currentTimeline
export const timelineIsExpandedSelector = state => state.ui.timelineIsExpanded
export const characterFilterSelector = state => state.ui.characterFilter
export const characterSortSelector = state => state.ui.characterSort
export const timelineFilterSelector = state => state.ui.timelineFilter

export const isSeriesSelector = createSelector(
  currentTimelineSelector,
  (currentTimeline) => currentTimeline == 'series'
)

export const timelineFilterIsEmptySelector = createSelector(
  timelineFilterSelector,
  (filter) => filter == null || (!filter['tag'].length && !filter['character'].length && !filter['place'].length)
)
