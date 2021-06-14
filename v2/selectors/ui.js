import { createSelector } from 'reselect'
import { isSeries } from '../helpers/books'

export const currentTimelineSelector = (state) => state.ui.currentTimeline
export const timelineIsExpandedSelector = (state) => state.ui.timelineIsExpanded
export const characterFilterSelector = (state) => state.ui.characterFilter
export const characterSortSelector = (state) => state.ui.characterSort
export const noteFilterSelector = (state) => state.ui.noteFilter
export const noteSortSelector = (state) => state.ui.noteSort
export const placeFilterSelector = (state) => state.ui.placeFilter
export const placeSortSelector = (state) => state.ui.placeSort
export const timelineFilterSelector = (state) => state.ui.timelineFilter
export const isSmallSelector = (state) => state.ui.timeline.size == 'small'
export const isMediumSelector = (state) => state.ui.timeline.size == 'medium'
export const isLargeSelector = (state) => state.ui.timeline.size == 'large'
export const timelineSizeSelector = (state) => state.ui.timeline.size
export const timelineScrollPositionSelector = (state) => state.ui.timelineScrollPosition
export const orientationSelector = (state) => state.ui.orientation
export const isDarkModeSelector = (state) => state.ui.darkMode
export const attributesDialogIsOpenSelector = (state) => state.ui.attributesDialogIsOpen

export const isSeriesSelector = createSelector(currentTimelineSelector, isSeries)

export const timelineFilterIsEmptySelector = createSelector(
  timelineFilterSelector,
  (filter) => filter == null || Object.keys(filter).every((key) => !filter[key].length)
)

export const timelineBundleSelector = createSelector(
  timelineScrollPositionSelector,
  currentTimelineSelector,
  orientationSelector,
  timelineSizeSelector,
  timelineIsExpandedSelector,
  isDarkModeSelector,
  attributesDialogIsOpenSelector,
  timelineFilterIsEmptySelector,
  isSmallSelector,
  isMediumSelector,
  isLargeSelector,
  (
    timelineScrollPosition,
    currentTimeline,
    orientation,
    timelineSize,
    timelineIsExpanded,
    darkMode,
    attributesDialogIsOpen,
    filterIsEmpty,
    isSmall,
    isMedium,
    isLarge
  ) => ({
    timelineScrollPosition,
    currentTimeline,
    orientation,
    timelineSize,
    timelineIsExpanded,
    darkMode,
    attributesDialogIsOpen,
    filterIsEmpty,
    isSmall,
    isMedium,
    isLarge,
  })
)
