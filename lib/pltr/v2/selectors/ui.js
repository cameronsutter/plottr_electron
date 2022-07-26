import { createSelector } from 'reselect'
import { isSeries } from '../helpers/books'
import { beatHierarchyIsOn } from './featureFlags'
import { allBookIdsSelector } from './books'
import { hierarchyLevelCount } from './hierarchy'
import { isDarkModeSelector } from './settings'

export const currentTimelineSelector = (state) => {
  const bookIds = allBookIdsSelector(state)
  const currentTimeline = state.ui.currentTimeline
  if (currentTimeline == 'series') return currentTimeline
  if (bookIds.includes(currentTimeline)) {
    return currentTimeline
  } else {
    return bookIds[0] || 1
  }
}
export const timelineIsExpandedSelector = (state) => state.ui.timelineIsExpanded
export const characterFilterSelector = (state) => state.ui.characterFilter
export const characterSortSelector = (state) => state.ui.characterSort
export const noteFilterSelector = (state) => state.ui.noteFilter
export const noteSortSelector = (state) => state.ui.noteSort
export const placeFilterSelector = (state) => state.ui.placeFilter
export const placeSortSelector = (state) => state.ui.placeSort
export const timelineFilterSelector = (state) => state.ui.timelineFilter
export const outlineFilterSelector = (state) => state.ui.outlineFilter
export const isSmallSelector = (state) => state.ui.timeline.size == 'small'
export const isMediumSelector = (state) => state.ui.timeline.size == 'medium'
export const isLargeSelector = (state) => state.ui.timeline.size == 'large'
export const timelineSizeSelector = (state) => state.ui.timeline.size
export const timelineScrollPositionSelector = (state) => state.ui.timelineScrollPosition
export const attributesDialogIsOpenSelector = (state) => state.ui.attributesDialogIsOpen
export const currentViewSelector = (state) => state.ui.currentView

export const isSeriesSelector = createSelector(currentTimelineSelector, isSeries)

export const timelineFilterIsEmptySelector = createSelector(
  timelineFilterSelector,
  (filter) => filter == null || Object.keys(filter).every((key) => !filter[key].length)
)

export const notesSearchTermSelector = (state) => state.ui.searchTerms?.notes
export const charactersSearchTermSelector = (state) => state.ui.searchTerms?.characters
export const placesSearchTermSelector = (state) => state.ui.searchTerms?.places
export const tagsSearchTermSelector = (state) => state.ui.searchTerms?.tags
export const outlineSearchTermSelector = (state) => state.ui.searchTerms?.outline
export const timelineSearchTermSelector = (state) => state.ui.searchTerms?.timeline

export const selectedTimelineViewSelector = (state) => state.ui.timeline.view || 'default'
export const timelineViewSelector = createSelector(
  selectedTimelineViewSelector,
  hierarchyLevelCount,
  beatHierarchyIsOn,
  (selectedView, levelsOfHierarchy, actStructureEnabled) => {
    if (!actStructureEnabled || (selectedView === 'tabbed' && levelsOfHierarchy < 2)) {
      return 'default'
    }
    return selectedView
  }
)
export const timelineViewIsTabbedSelector = createSelector(timelineViewSelector, (view) => {
  return view === 'tabbed'
})
export const timelineViewIsStackedSelector = createSelector(timelineViewSelector, (view) => {
  return view === 'stacked'
})
export const timelineSelectedTabSelector = (state) => state.ui.timeline?.actTab || 0
export const timelineViewIsDefaultSelector = createSelector(timelineViewSelector, (view) => {
  return view === 'default'
})
export const timelineViewIsntDefaultSelector = createSelector(timelineViewSelector, (view) => {
  return view !== 'default'
})
const selectedOrientationSelector = (state) => state.ui.orientation
export const orientationSelector = createSelector(
  selectedOrientationSelector,
  isSmallSelector,
  timelineViewIsStackedSelector,
  (selectedOrientation, isSmall, timelineViewIsStacked) => {
    // Force horizontal view when we're on the stacked timeline.
    // Wehaven't thought through how flipped should look.
    if (selectedOrientation === 'vertical' && !isSmall && timelineViewIsStacked) {
      return 'horizontal'
    }
    return selectedOrientation
  }
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
