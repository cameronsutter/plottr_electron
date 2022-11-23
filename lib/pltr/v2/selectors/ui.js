import { createSelector } from 'reselect'
import { isSeries } from '../helpers/books'
import { beatHierarchyIsOn } from './featureFlags'
import { allBookIdsSelector } from './books'
import { hierarchyLevelCount } from './hierarchy'
import { isDarkModeSelector } from './settings'
import { showBookTabs } from './attributeTabs'
import { shouldBeInProSelector } from './shouldBeInPro'
import { userIdSelector } from './client'
import { permissionSelector } from './permission'

const rootUiSelector = (state) => state.ui
export const uiSelector = createSelector(
  shouldBeInProSelector,
  userIdSelector,
  permissionSelector,
  rootUiSelector,
  (shouldBeLoggedIn, userId, permission, ui) => {
    if (!shouldBeLoggedIn) {
      return ui
    } else if (!userId || !permission) {
      return ui
    } else if (permission === 'owner') {
      return ui
    } else if (permission === 'collaborator') {
      const existingUI = ui.collaborators?.collaborators?.find((collaborator) => {
        if (collaborator.id === userId) {
          return true
        }
        return false
      })

      return existingUI || ui
    } else if (permission === 'viewer') {
      const existingUI = ui.collaborators?.viewers?.find((viewer) => {
        if (viewer.id === userId) {
          return true
        }
        return false
      })

      return existingUI || ui
    } else {
      return ui
    }
  }
)

export const currentTimelineSelector = createSelector(
  uiSelector,
  allBookIdsSelector,
  (ui, bookIds) => {
    const currentTimeline = ui.currentTimeline
    if (currentTimeline == 'series') return currentTimeline
    if (bookIds.includes(currentTimeline)) {
      return currentTimeline
    } else {
      return bookIds[0] || 1
    }
  }
)
export const timelineIsExpandedSelector = createSelector(uiSelector, ({ timelineIsExpanded }) => {
  return timelineIsExpanded
})
export const characterFilterSelector = createSelector(uiSelector, ({ characterFilter }) => {
  return characterFilter
})
export const characterSortSelector = createSelector(uiSelector, ({ characterSort }) => {
  return characterSort
})
export const noteFilterSelector = createSelector(uiSelector, ({ noteFilter }) => {
  return noteFilter
})
export const noteSortSelector = createSelector(uiSelector, ({ noteSort }) => {
  return noteSort
})
export const placeFilterSelector = createSelector(uiSelector, ({ placeFilter }) => {
  return placeFilter
})
export const placeSortSelector = createSelector(uiSelector, ({ placeSort }) => {
  return placeSort
})
export const timelineFilterSelector = createSelector(uiSelector, ({ timelineFilter }) => {
  return timelineFilter
})
export const outlineFilterSelector = createSelector(uiSelector, ({ outlineFilter }) => {
  return outlineFilter
})
const timelineSelector = createSelector(uiSelector, ({ timeline }) => {
  return timeline
})
export const timelineSizeSelector = createSelector(timelineSelector, ({ size }) => {
  return size
})
export const isSmallSelector = createSelector(timelineSizeSelector, (size) => {
  return size == 'small'
})
export const isMediumSelector = createSelector(timelineSizeSelector, (size) => {
  return size === 'medium'
})
export const isLargeSelector = createSelector(timelineSizeSelector, (size) => {
  return size == 'large'
})
export const timelineScrollPositionSelector = createSelector(
  uiSelector,
  ({ timelineScrollPosition }) => {
    return timelineScrollPosition
  }
)
export const attributesDialogIsOpenSelector = createSelector(
  uiSelector,
  ({ attributesDialogIsOpen }) => {
    return attributesDialogIsOpen
  }
)
export const currentViewSelector = createSelector(uiSelector, ({ currentView }) => {
  return currentView
})
const cardDialogSelector = createSelector(uiSelector, ({ cardDialog }) => {
  return cardDialog
})
const bookDialogSelector = createSelector(uiSelector, ({ bookDialog }) => {
  return bookDialog
})

export const cardDialogCardIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.cardId
})
export const cardDialogLineIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.lineId
})
export const cardDialogBeatIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.beatId
})
export const isCardDialogVisibleSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.isOpen
})

export const isBookDialogVisibleSelector = createSelector(bookDialogSelector, (bookDialog) => {
  return bookDialog?.isOpen
})

export const bookDialogBookIdSelector = createSelector(bookDialogSelector, (bookDialog) => {
  return bookDialog?.bookId
})

export const bookNumberSelector = createSelector(
  allBookIdsSelector,
  bookDialogBookIdSelector,
  (allBookIds, bookDialogBookId) => {
    if (bookDialogBookId) {
      return allBookIds.indexOf(bookDialogBookId) + 1
    }

    return allBookIds.length + 1
  }
)

export const isSeriesSelector = createSelector(currentTimelineSelector, isSeries)

export const timelineFilterIsEmptySelector = createSelector(
  timelineFilterSelector,
  (filter) => filter == null || Object.keys(filter).every((key) => !filter[key].length)
)

const searchTermSelector = createSelector(uiSelector, ({ searchTerms }) => {
  return searchTerms
})
export const notesSearchTermSelector = createSelector(searchTermSelector, (searchTerms) => {
  return searchTerms?.notes
})
export const charactersSearchTermSelector = createSelector(searchTermSelector, (searchTerms) => {
  return searchTerms?.characters
})
export const placesSearchTermSelector = createSelector(searchTermSelector, (searchTerms) => {
  return searchTerms?.places
})
export const tagsSearchTermSelector = createSelector(searchTermSelector, (searchTerms) => {
  return searchTerms?.tags
})
export const outlineSearchTermSelector = createSelector(searchTermSelector, (searchTerms) => {
  return searchTerms?.outline
})
export const timelineSearchTermSelector = createSelector(searchTermSelector, (searchTerms) => {
  return searchTerms?.timeline
})

export const selectedTimelineViewSelector = createSelector(timelineSelector, (timeline) => {
  return timeline?.view || 'default'
})
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
export const timelineSelectedTabSelector = createSelector(timelineSelector, (timeline) => {
  return timeline?.actTab || 0
})
export const timelineViewIsDefaultSelector = createSelector(timelineViewSelector, (view) => {
  return view === 'default'
})
export const timelineViewIsntDefaultSelector = createSelector(timelineViewSelector, (view) => {
  return view !== 'default'
})
const selectedOrientationSelector = createSelector(uiSelector, ({ orientation }) => {
  return orientation
})
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

const allCharactersSelector = (state) => state.characters

const showBookTabsSelector = createSelector(allBookIdsSelector, allCharactersSelector, showBookTabs)

export const attributeTabsSelector = createSelector(uiSelector, ({ attributeTabs }) => {
  return attributeTabs || {}
})
export const selectedCharacterAttributeTabSelector = createSelector(
  attributeTabsSelector,
  showBookTabsSelector,
  ({ characters }, showTabs) => {
    return showTabs ? characters || 'all' : 'all'
  }
)
export const characterTabSelector = createSelector(uiSelector, ({ characterTab }) => {
  return characterTab || {}
})
export const selectedCharacterSelector = createSelector(
  characterTabSelector,
  ({ selectedCharacter }) => {
    if (selectedCharacter || selectedCharacter === 0) {
      return selectedCharacter
    }

    return null
  }
)
const customAttributeOrderSelector = createSelector(uiSelector, ({ customAttributeOrder }) => {
  return customAttributeOrder || []
})
export const characterCustomAttributeOrderSelector = createSelector(
  customAttributeOrderSelector,
  ({ characters }) => characters || []
)
