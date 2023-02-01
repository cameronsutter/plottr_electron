import { create, repeat } from 'lodash'
import { createSelector } from 'reselect'

import { isSeries } from '../helpers/books'
import { depth } from '../reducers/tree'
import { noEntityHasLegacyAttributeBound } from './noEntitiyHasValueBound'

// Other selector dependencies
import { allCardsSelector } from './cardsFirstOrder'
import { allBeatsSelector, beatIdSelector } from './beatsFirstOrder'
import { previouslyLoggedIntoProSelector } from './settingsFirstOrder'
import { isOnWebSelector, userIdSelector } from './clientFirstOrder'
import { permissionSelector } from './permissionFirstOrder'
import { allBookIdsSelector } from './booksFirstOrder'
import {
  cardsCustomAttributesSelector,
  noteCustomAttributesSelector,
  placeCustomAttributesSelector,
} from './customAttributesFirstOrder'
import { allNotesSelector } from './notesFirstOrder'

export const shouldBeInProSelector = createSelector(
  previouslyLoggedIntoProSelector,
  isOnWebSelector,
  (previouslyLoggedIntoPro, isOnWeb) => {
    return !!(previouslyLoggedIntoPro || isOnWeb)
  }
)

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
export const editingBeatTitleIdSelector = createSelector(timelineSelector, ({ editingBeatId }) => {
  return editingBeatId
})
export const contextMenuBeatTimelineSelector = createSelector(
  timelineSelector,
  ({ contextMenuBeat }) => {
    return contextMenuBeat
  }
)
export const timelineBeatToDeleteSelector = createSelector(timelineSelector, ({ beatToDelete }) => {
  return beatToDelete
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

export const isSeriesSelector = createSelector(currentTimelineSelector, isSeries)

export const timelineFilterIsEmptySelector = createSelector(
  timelineFilterSelector,
  (filter) => filter == null || Object.keys(filter).every((key) => !filter[key].length)
)

export const searchTermSelector = createSelector(uiSelector, ({ searchTerms }) => {
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
const levels = (state) => state.hierarchyLevels
export const hierarchyLevelsSelector = createSelector(
  levels,
  currentTimelineSelector,
  (allLevels, timeline) => {
    return allLevels[timeline]
  }
)
export const hierarchyLevelCount = createSelector(hierarchyLevelsSelector, (hierarchyLevels) => {
  return Object.keys(hierarchyLevels).length
})
export const timelineViewSelector = createSelector(
  selectedTimelineViewSelector,
  hierarchyLevelCount,
  (selectedView, levelsOfHierarchy) => {
    if (selectedView === 'tabbed' && levelsOfHierarchy < 2) {
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

export const actConfigModalSelector = createSelector(uiSelector, ({ actConfigModal }) => {
  return actConfigModal || {}
})
export const actConfigModalIsOpenSelector = createSelector(actConfigModalSelector, ({ open }) => {
  return open
})

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

const templateModalSelector = createSelector(uiSelector, ({ templateModal }) => {
  return templateModal || {}
})
export const templateModalAdvancedPanelOpenSelector = createSelector(
  templateModalSelector,
  ({ expanded }) => {
    return !!expanded
  }
)

export const cardsCustomAttributesThatCanChangeSelector = createSelector(
  allCardsSelector,
  cardsCustomAttributesSelector,
  noEntityHasLegacyAttributeBound
)

export const notesCustomAttributesThatCanChangeSelector = createSelector(
  allNotesSelector,
  noteCustomAttributesSelector,
  noEntityHasLegacyAttributeBound
)

export const beatsByBookSelector = createSelector(
  allBeatsSelector,
  currentTimelineSelector,
  (beats, bookId) => {
    return beats[bookId]
  }
)

export const sortedHierarchyLevels = createSelector(
  hierarchyLevelCount,
  hierarchyLevelsSelector,
  (levels, hierarchyLevels) => {
    const sortedLevels = []
    for (let i = 0; i < levels; ++i) {
      sortedLevels.push(hierarchyLevels[i])
    }
    return sortedLevels
  }
)
export const hierarchyLevelSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    return hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1]
  }
)

export const atMaximumHierarchyDepthSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    return depth(beats, beatId) === hierarchyLevels.length - 1
  }
)

export const hierarchyLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    if (!beatId) return hierarchyLevels[0].name
    return (hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1])
      .name
  }
)

export const beatInsertControlHierarchyLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  timelineViewIsTabbedSelector,
  (beats, beatId, hierarchyLevels, timelineViewIsTabbed) => {
    if (timelineViewIsTabbed && (!beatId || depth(beats, beatId) === 0)) {
      return (hierarchyLevels[1] || hierarchyLevels[0]).name
    }

    return (hierarchyLevels[depth(beats, beatId)] || hierarchyLevels[hierarchyLevels.length - 1])
      .name
  }
)

export const hierarchyChildLevelNameSelector = createSelector(
  beatsByBookSelector,
  beatIdSelector,
  sortedHierarchyLevels,
  (beats, beatId, hierarchyLevels) => {
    if (!beatId) return (hierarchyLevels[1] || hierarchyLevels[0]).name
    const newDepth = depth(beats, beatId) + 1
    const level = hierarchyLevels[newDepth]
    if (level) {
      return level.name
    } else {
      return `${repeat('Sub-', newDepth - hierarchyLevels.length + 1)}${
        (hierarchyLevels[hierarchyLevels.length - 1] || { name: '' }).name
      }`
    }
  }
)

export const placeFilterIsEmptySelector = createSelector(
  placeFilterSelector,
  placeCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [{ name: 'tag' }, { name: 'book' }, ...attributes]
    return !allAttributes.some((attr) => filter[attr.name] && filter[attr.name].length)
  }
)

export const noteFilterIsEmptySelector = createSelector(
  noteFilterSelector,
  noteCustomAttributesSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [
      { name: 'place' },
      { name: 'tag' },
      { name: 'book' },
      { name: 'noteCategory' },
      { name: 'character' },
      ...attributes,
    ]
    return !allAttributes.some((attr) => filter[attr.name] && filter[attr.name].length)
  }
)

export const topLevelBeatNameSelector = createSelector(sortedHierarchyLevels, (levels) => {
  return levels[0].name
})
