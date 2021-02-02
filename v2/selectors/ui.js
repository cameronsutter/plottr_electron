import { createSelector } from 'reselect'

export const currentTimelineSelector = (state) => state.ui.currentTimeline
export const timelineIsExpandedSelector = (state) => state.ui.timelineIsExpanded
export const characterFilterSelector = (state) => state.ui.characterFilter
export const characterSortSelector = (state) => state.ui.characterSort
export const placeFilterSelector = (state) => state.ui.placeFilter
export const placeSortSelector = (state) => state.ui.placeSort
export const timelineFilterSelector = (state) => state.ui.timelineFilter
export const isSmallSelector = (state) => state.ui.timeline.size == 'small'
export const isMediumSelector = (state) => state.ui.timeline.size == 'medium'
export const isLargeSelector = (state) => state.ui.timeline.size == 'large'

export const isSeriesSelector = createSelector(
  currentTimelineSelector,
  (currentTimeline) => currentTimeline == 'series'
)

export const timelineFilterIsEmptySelector = createSelector(
  timelineFilterSelector,
  (filter) =>
    filter == null ||
    (!filter['tag'].length && !filter['character'].length && !filter['place'].length)
)
