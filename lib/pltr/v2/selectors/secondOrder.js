import {
  sortBy,
  keyBy,
  groupBy,
  differenceWith,
  isEqual,
  mapValues,
  uniq,
  omit,
  times,
  repeat,
  forEach,
  reduce,
} from 'lodash'
import { createSelector } from 'reselect'

import { getDateValue, urlPointsToPlottrCloud } from '../helpers/file'
import { outOfOrderSearch } from '../helpers/outOfOrderSearch'
import { isSeries } from '../helpers/books'
import { depth, findNode, nodeParent, children } from '../reducers/tree'
import {
  maxDepth,
  beatsByPosition,
  rootParentId,
  beatTitle,
  numberOfPriorChildrenAtSameDepth,
  beatOneIsPrologue,
} from '../helpers/beats'
import { createDeepEqualSelector } from './createDeepEqualSelector'

// Other selector dependencies
import { allLinesSelector, bookIdSelector } from './lines'
import { allCardMetaDataSelector, allCardsSelector } from './cards'
import {
  allBeatsSelector,
  beatIdSelector,
  visibleBeatsByPositionForTimeline,
  visibleBeatsByPositionIgnoringCollapsed,
  visibleBeatsForTopLevelParentByPosition,
} from './beats'
import { beatHierarchyIsOn } from './featureFlags'
import {
  backupEnabledSelector,
  localBackupsEnabledSelector,
  offlineModeEnabledSelector,
  previouslyLoggedIntoProSelector,
  isDarkModeSelector,
} from './settings'
import { hasProSelector, isLoggedInSelector, isOnWebSelector, userIdSelector } from './client'
import { showBookTabs } from './attributeTabs'
import { permissionSelector } from './permission'
import { allBookIdsSelector, allBooksSelector } from './books'
import {
  applicationSettingsAreLoadedSelector,
  checkedLicenseSelector,
  checkedProSubscriptionSelector,
  checkedTrialSelector,
  checkingLicenseSelector,
  checkingTrialSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  filePathToUploadSelector,
  importingNewProjectSelector,
  isOnboardingToProSelector,
  manipulatingAFileSelector,
  sessionCheckedSelector,
  checkingSessionSelector,
} from './applicationState'
import {
  isOfflineSelector,
  isResumingSelector,
  loadingFileSelector,
  loadingFileSelector as deprecatedLoadingFileSelector,
  projectSelector,
  fileURLSelector,
  hasAllKeysSelector,
} from './project'
import { hasLicenseSelector, trialExpiredSelector, trialStartedSelector } from './license'
import { fileIsLoadedSelector } from './file'
import { cloudFileListSelector, fileSystemKnownFilesSelector } from './knownFiles'
import {
  allCustomTemplatesSelector,
  templateSearchTermSelector,
  templatesSelector,
  templateTypeSelector,
} from './templates'
import { displayedSingleCharacter, singleCharacterSelector } from './characters'
import {
  attributesSelector,
  characterAttributsForBookByIdSelector,
  overriddenBookIdSelector,
} from './attributes'
import {
  cardsCustomAttributesSelector,
  characterCustomAttributesSelector,
  noteCustomAttributesSelector,
  placeCustomAttributesSelector,
} from './customAttributes'
import {
  allPlacesSelector,
  placesByCategorySelector,
  placesSortedAtoZSelector,
  stringifiedPlacesByIdSelector,
} from './places'
import { allNotesSelector, notesByCategorySelector, stringifiedNotesByIdSelector } from './notes'
import { stringifiedTagsByIdSelector, tagsByCategorySelector } from './tags'

export const linesByBookSelector = createSelector(
  allLinesSelector,
  currentTimelineSelector,
  (lines, bookId) => {
    return lines.filter((l) => l && l.bookId == bookId)
  }
)

export const sortedLinesByBookSelector = createSelector(linesByBookSelector, (lines) =>
  sortBy(lines, 'position')
)

export const lineIsExpandedSelector = createSelector(
  linesByBookSelector,
  timelineIsExpandedSelector,
  (lines, isExpanded) => {
    return lines.reduce((acc, l) => {
      // if line.expanded is null, then use timelineIsExpanded
      // else use line.expanded
      if (l.expanded == null) acc[l.id] = isExpanded
      else acc[l.id] = l.expanded

      return acc
    }, {})
  }
)

export const linePositionMappingSelector = createSelector(linesByBookSelector, (lines) => {
  return lines.reduce((acc, line) => {
    acc[line.position] = line
    return acc
  }, {})
})

export const lineMaxCardsSelector = createSelector(
  linesByBookSelector,
  cardMapSelector,
  visibleSortedBeatsByBookSelector,
  (lines, cardMap, beats) => {
    return lines.reduce((acc, l) => {
      let max = 0
      beats.forEach((beat) => {
        const cards = cardMap[`${l.id}-${beat.id}`]
        if (cards && cards.length > max) max = cards.length
      })
      acc[l.id] = max
      return acc
    }, {})
  }
)

export const linesById = createSelector(sortedLinesByBookSelector, (lines) => {
  return keyBy(lines, 'id')
})

export const cardsExistOnTimelineSelector = createSelector(
  allCardMetaDataSelector,
  visibleSortedBeatsByBookIgnoringCollapsedSelector,
  (allCardsMetaData, visibleSortedBeats) => {
    return (
      allCardsMetaData.filter(({ beatId }) => visibleSortedBeats.find(({ id }) => id === beatId))
        .length > 0
    )
  }
)

export const collapsedBeatSelector = createSelector(
  beatsByBookSelector,
  sortedBeatsByBookSelector,
  (beatTree, sortedBeats) => {
    const collapsedBeats = new Map()
    const firstCollapsedParent = (beatId) => {
      if (!beatId) return null
      if (collapsedBeats.has(beatId)) {
        return collapsedBeats.get(beatId)
      }
      const directParentId = nodeParent(beatTree, beatId)
      const collapsedParentId = firstCollapsedParent(directParentId)
      if (collapsedParentId) {
        collapsedBeats.set(beatId, collapsedParentId)
        return collapsedParentId
      }
      const thisBeat = findNode(beatTree, beatId)
      if (!thisBeat.expanded) {
        collapsedBeats.set(beatId, beatId)
        return beatId
      }
      collapsedBeats.set(beatId, null)
      return null
    }
    sortedBeats.forEach((beat) => {
      firstCollapsedParent(beat.id)
    })
    return collapsedBeats
  }
)

export const cardMapSelector = createSelector(
  allCardsSelector,
  collapsedBeatSelector,
  sortedBeatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsntDefaultSelector,
  (cards, collapsedBeats, allSortedBeats, hierarchyIsOn, timelineViewIsntDefault) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    return cards.reduce(
      cardReduce(
        'lineId',
        'beatId',
        hierarchyIsOn && !timelineViewIsntDefault && collapsedBeats,
        beatPositions
      ),
      {}
    )
  }
)

export const outlineSearchedCardMapSelector = createSelector(
  allCardsSelector,
  collapsedBeatSelector,
  sortedBeatsByBookSelector,
  beatHierarchyIsOn,
  outlineSearchTermSelector,
  stringifiedCardsByIdSelector,
  (cards, collapsedBeats, allSortedBeats, hierarchyIsOn, outlineSearchTerm, stringifiedCards) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    const lowerCaseSearchTerms =
      outlineSearchTerm &&
      outlineSearchTerm
        .toLowerCase()
        .split(' ')
        .filter((x) => x)
    const filteredCards = lowerCaseSearchTerms
      ? cards.filter(({ id }) => {
          return outOfOrderSearch(lowerCaseSearchTerms, stringifiedCards[id])
        })
      : cards
    return filteredCards.reduce(
      cardReduce('lineId', 'beatId', hierarchyIsOn && collapsedBeats, beatPositions),
      {}
    )
  }
)

export const cardMetaDataMapSelector = createDeepEqualSelector(
  allCardMetaDataSelector,
  collapsedBeatSelector,
  sortedBeatsByBookSelector,
  beatHierarchyIsOn,
  (cards, collapsedBeats, allSortedBeats, hierarchyIsOn) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    return cards.reduce(
      cardReduce('lineId', 'beatId', hierarchyIsOn && collapsedBeats, beatPositions),
      {}
    )
  }
)

export const searchedCardMetaDataMapSelector = createDeepEqualSelector(
  allCardMetaDataSelector,
  collapsedBeatSelector,
  visibleSortedBeatsForTimelineByBookSelector,
  beatHierarchyIsOn,
  timelineSearchTermSelector,
  stringifiedCardsByIdSelector,
  beatsByBookSelector,
  timelineViewIsStackedSelector,
  hierarchyLevelCount,
  timelineViewIsntDefaultSelector,
  (
    cards,
    collapsedBeats,
    allSortedBeats,
    hierarchyIsOn,
    timelineSearchTerm,
    stringifiedCards,
    beats,
    timelineViewIsStacked,
    hierarchyLevelCount,
    timelineViewIsntDefault
  ) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    const lowerCaseSearchTerms =
      timelineSearchTerm &&
      timelineSearchTerm
        .toLowerCase()
        .split(' ')
        .filter((x) => x)

    const filteredCards = (
      lowerCaseSearchTerms
        ? cards.filter(({ id, beatId }) => {
            return outOfOrderSearch(lowerCaseSearchTerms, stringifiedCards[id])
          })
        : cards
    ).filter(({ beatId }) => {
      const beatIsALeaf = depth(beats, beatId) === hierarchyLevelCount - 1
      return !timelineViewIsStacked || beatIsALeaf
    })

    return filteredCards.reduce(
      cardReduce(
        'lineId',
        'beatId',
        hierarchyIsOn && !timelineViewIsntDefault && collapsedBeats,
        beatPositions
      ),
      {}
    )
  }
)

export const visibleCardsSelector = createSelector(
  allCardsSelector,
  timelineFilterSelector,
  timelineFilterIsEmptySelector,
  (cards, filter, filterIsEmpty) => {
    return cards.reduce((acc, c) => {
      acc[c.id] = cardIsVisible(c, filter, filterIsEmpty)
      return acc
    }, {})
  }
)

const stringifiedCardsByIdSelector = createSelector(allCardsSelector, (cards) => {
  return cards.reduce((acc, nextCard) => {
    return {
      ...acc,
      [nextCard.id]: JSON.stringify(nextCard).toLowerCase(),
    }
  }, {})
})

function cardReduce(lineAttr, beatAttr, collapsedBeats, beatPositions) {
  return (acc, card) => {
    const cardBeatId = card[beatAttr]
    const beatId = (collapsedBeats && collapsedBeats.get(cardBeatId)) || cardBeatId
    const val = acc[`${card[lineAttr]}-${beatId}`]
    if (val && val.length) {
      const cards = [...val, card]
      const sortedCards = sortBy(sortBy(cards, 'positionWithinLine'), (card) => {
        const beatId = card[beatAttr]
        return beatPositions[beatId]
      })
      acc[`${card[lineAttr]}-${beatId}`] = sortedCards
    } else {
      acc[`${card[lineAttr]}-${beatId}`] = [card]
    }

    return acc
  }
}

function cardIsVisible(card, filter, filterIsEmpty) {
  if (filterIsEmpty) return true

  return Object.keys(filter).some((attr) => {
    return filter[attr].some((val) => {
      if (card[attr] !== undefined) {
        return card[attr] === val
      }
      if (!val && !card[attr]) {
        return true
      }
      if (attr == 'tag') {
        return card.tags.includes(val)
      }
      if (attr == 'character') {
        return card.characters.includes(val)
      }
      if (attr == 'place') {
        return card.places.includes(val)
      }
      return false
    })
  })
}

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

export const outlineScrollPositionSelector = createSelector(
  uiSelector,
  ({ outlineScrollPosition }) => outlineScrollPosition
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

const templateModalSelector = createSelector(uiSelector, ({ templateModal }) => {
  return templateModal || {}
})
export const templateModalAdvancedPanelOpenSelector = createSelector(
  templateModalSelector,
  ({ expanded }) => {
    return !!expanded
  }
)

export const needToCheckProSubscriptionSelector = createSelector(
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  (shouldBeInPro, checkedProSubscription) => {
    return shouldBeInPro && !checkedProSubscription
  }
)

export const isInOfflineModeSelector = createSelector(
  isOfflineSelector,
  shouldBeInProSelector,
  offlineModeEnabledSelector,
  (isOffline, shouldBeInPro, offlineModeEnabled) => {
    return isOffline && shouldBeInPro && offlineModeEnabled
  }
)

export const checkingSessionOrNeedToCheckSessionSelector = createSelector(
  sessionCheckedSelector,
  checkingSessionSelector,
  isInOfflineModeSelector,
  (sessionChecked, checkingSession, isInOfflineMode) => {
    return !isInOfflineMode && (checkingSession || !sessionChecked)
  }
)

export const applicationIsBusyAndUninterruptableSelector = createSelector(
  busyLoadingFileOrNeedToLoadFileSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isOnboardingToProSelector,
  importingNewProjectSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    busyLoadingFileOrNeedToLoadFile,
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isOnboardingToPro,
    isImportingNewProject,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    return (
      busyLoadingFileOrNeedToLoadFile ||
      checkingWhatToLoadOrNeedToCheckWhatToLoad ||
      manipulatingAFile ||
      !applicationSettingsAreLoaded ||
      (checkingSessionOrNeedToCheckSession && !isOnboardingToPro) ||
      isImportingNewProject ||
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
      // TODO: Web doesn't have trials or licenses to load.
      !checkedLicense ||
      !checkedTrial
    )
  }
)

export const applicationIsBusyButFileCouldBeUnloadedSelector = createSelector(
  isFirstTimeSelector,
  isInTrialModeWithExpiredTrialSelector,
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  isInOfflineModeSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    firstTime,
    isInTrialModeWithExpiredTrial,
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    isInOfflineMode,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    return (
      // We only check what to load when we're in a valid license
      // state.  So we need to account for there being no license or
      // there being an expired trial.
      (!firstTime && !isInTrialModeWithExpiredTrial && checkingWhatToLoadOrNeedToCheckWhatToLoad) ||
      loadingFile ||
      manipulatingAFile ||
      !applicationSettingsAreLoaded ||
      (!isInOfflineMode && checkingSessionOrNeedToCheckSession) ||
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
      // TODO: Web doesn't have trials or licenses to load.
      !checkedLicense ||
      !checkedTrial
    )
  }
)

export const loadingStateSelector = createSelector(
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkingLicenseSelector,
  checkingTrialSelector,
  (
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkingLicense,
    checkingTrial
  ) => {
    if (checkingWhatToLoadOrNeedToCheckWhatToLoad) {
      return 'Locating document...'
    }
    if (loadingFile) {
      return 'Placing document on table...'
    }
    if (manipulatingAFile) {
      return 'Spilling ink on desk...'
    }
    if (!applicationSettingsAreLoaded) {
      return 'Loading settings...'
    }
    if (checkingSessionOrNeedToCheckSession) {
      return 'Security checkpoint...'
    }
    if (
      (isLoggedIn && shouldBeInPro && !checkedProSubscription) ||
      checkingLicense ||
      checkingTrial
    ) {
      return 'Checking your ticket...'
    }
    return 'Done!'
  }
)

export const loadingProgressSelector = createSelector(
  checkingWhatToLoadOrNeedToCheckWhatToLoadSelector,
  loadingFileSelector,
  manipulatingAFileSelector,
  applicationSettingsAreLoadedSelector,
  checkingSessionOrNeedToCheckSessionSelector,
  isLoggedInSelector,
  shouldBeInProSelector,
  checkedProSubscriptionSelector,
  checkedLicenseSelector,
  checkedTrialSelector,
  (
    checkingWhatToLoadOrNeedToCheckWhatToLoad,
    loadingFile,
    manipulatingAFile,
    applicationSettingsAreLoaded,
    checkingSessionOrNeedToCheckSession,
    isLoggedIn,
    shouldBeInPro,
    checkedProSubscription,
    checkedLicense,
    checkedTrial
  ) => {
    let progress = 0
    if (!checkingWhatToLoadOrNeedToCheckWhatToLoad) {
      progress++
    }
    if (!applicationSettingsAreLoaded) {
      progress++
    }
    if (!checkingSessionOrNeedToCheckSession) {
      progress++
    }
    if (!(isLoggedIn && shouldBeInPro && !checkedProSubscription)) {
      progress++
    }
    if (checkedLicense) {
      progress++
    }
    if (checkedTrial) {
      progress++
    }
    return 100.0 * (progress / 6.0)
  }
)

export const userNeedsToLoginSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  shouldBeInProSelector,
  sessionCheckedSelector,
  isLoggedInSelector,
  (settingsAreLoaded, shouldBeInPro, sessionChecked, isLoggedIn) => {
    return settingsAreLoaded && shouldBeInPro && sessionChecked && !isLoggedIn
  }
)

export const isInSomeValidLicenseStateSelector = createSelector(
  applicationSettingsAreLoadedSelector,
  sessionCheckedSelector,
  userNeedsToLoginSelector,

  isInOfflineModeSelector,
  needToCheckProSubscriptionSelector,
  hasProSelector,
  hasLicenseSelector,
  isInTrialModeSelector,
  (
    applicationSettingsAreLoaded,
    sessionChecked,
    needsToLogin,

    isInOfflineMode,
    needToCheckProSubscription,
    hasPro,
    hasLicense,
    isInTrialMode
  ) => {
    return (
      applicationSettingsAreLoaded &&
      (isInOfflineMode ||
        (sessionChecked &&
          !needsToLogin &&
          !needToCheckProSubscription &&
          (hasPro || hasLicense || isInTrialMode)))
    )
  }
)

export const readyToCheckFileToLoadSelector = createSelector(
  isInSomeValidLicenseStateSelector,
  filePathToUploadSelector,
  (inValidLicenseState, filePathToUpload) => {
    return !filePathToUpload && inValidLicenseState
  }
)

export const cantShowFileSelector = createSelector(
  fileIsLoadedSelector,
  hasProSelector,
  isCloudFileSelector,
  isResumingSelector,
  isOfflineSelector,
  isInOfflineModeSelector,
  shouldBeInProSelector,
  (
    fileLoaded,
    hasActiveProSubscription,
    selectedFileIsACloudFile,
    isResuming,
    isOffline,
    isInOfflineMode,
    shouldBeInPro
  ) => {
    return (
      !isResuming &&
      (!fileLoaded ||
        (!isInOfflineMode && isOffline && shouldBeInPro) ||
        (!isInOfflineMode && !!hasActiveProSubscription !== !!selectedFileIsACloudFile))
    )
  }
)

export const isInTrialModeSelector = createSelector(
  trialStartedSelector,
  trialExpiredSelector,
  hasLicenseSelector,
  hasProSelector,
  shouldBeInProSelector,
  (started, trialExpired, hasLicense, hasCurrentProLicense, shouldBeInPro) => {
    return started && !trialExpired && !hasLicense && !hasCurrentProLicense && !shouldBeInPro
  }
)

export const isFirstTimeSelector = createSelector(
  hasLicenseSelector,
  trialStartedSelector,
  hasProSelector,
  shouldBeInProSelector,
  (hasLicense, trialStarted, hasCurrentProLicense, shouldBeInPro) => {
    return !hasLicense && !trialStarted && !hasCurrentProLicense && !shouldBeInPro
  }
)

const filesByPosition = (filesArray) => {
  const byPosition = {}
  filesArray.forEach((file, index) => {
    byPosition[index + 1] = file
  })
  return byPosition
}
const filesById = (filesArray) => {
  const byId = {}
  filesArray.forEach((file, index) => {
    byId[file.id] = file
  })
  return byId
}

export const sortedKnownFilesSelector = createSelector(
  fileSystemKnownFilesSelector,
  cloudFileListSelector,
  shouldBeInProSelector,
  isLoggedInSelector,
  searchTermSelector,
  (fileSystemFiles, cloudFiles, shouldBeInPro, isLoggedIn, searchTerm) => {
    if (shouldBeInPro && !isLoggedIn) {
      return [[], {}]
    }
    const files = shouldBeInPro ? filesByPosition(cloudFiles) : filesById(fileSystemFiles)
    const filteredFileIds = Object.keys(files).filter((id) => {
      if (searchTerm && searchTerm.length > 1) {
        const f = files[`${id}`]
        return (f.fileName || f.path).toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return true
      }
    })
    const sortedIds = sortBy(filteredFileIds, (id) => getDateValue(files[`${id}`])).reverse()

    return [sortedIds, files]
  }
)

export const flatSortedKnownFilesSelector = createSelector(
  fileSystemKnownFilesSelector,
  cloudFileListSelector,
  shouldBeInProSelector,
  isLoggedInSelector,
  searchTermSelector,
  (fileSystemFiles, cloudFiles, shouldBeInPro, isLoggedIn, searchTerm) => {
    if (shouldBeInPro && !isLoggedIn) {
      return []
    }
    const files = shouldBeInPro ? cloudFiles : fileSystemFiles
    const filteredFiles = files.filter((file) => {
      if (searchTerm && searchTerm.length > 1) {
        return file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return true
      }
    })
    const sorted = sortBy(filteredFiles, (file) => getDateValue(file)).reverse()

    return sorted
  }
)

export const busyLoadingFileOrNeedToLoadFileSelector = createSelector(
  deprecatedLoadingFileSelector,
  loadingFileSelector,
  fileIsLoadedSelector,
  (fileIsLoadingDeprecated, fileIsLoading, loadedAFileBefore) => {
    return fileIsLoadingDeprecated || fileIsLoading || !loadedAFileBefore
  }
)

export const customTemplatesSelector = createSelector(
  allCustomTemplatesSelector,
  isLoggedInSelector,
  (allCustomTemplates, isLoggedIn) => {
    // Produce cloud templates when logged in and non-cloud templates
    // when not logged in.
    return sortBy(
      allCustomTemplates.filter(({ isCloudTemplate }) => !!isCloudTemplate === !!isLoggedIn),
      'name'
    )
  }
)

const templateIdSelector = (state, templateId) => templateId
export const templateByIdSelector = createSelector(
  templatesSelector,
  customTemplatesSelector,
  templateIdSelector,
  (templates, customTemplates, templateId) => {
    const finder = ({ id }) => id === templateId
    return templates.find(finder) || customTemplates.find(finder)
  }
)
export const templateByIdFnSelector = createSelector(
  templatesSelector,
  customTemplatesSelector,
  (templates, customTemplates) => (templateId) => {
    const finder = ({ id }) => id === templateId
    return templates.find(finder) || customTemplates.find(finder)
  }
)

export const filteredSortedCustomTemplatesSelector = createSelector(
  customTemplatesSelector,
  templateTypeSelector,
  templateSearchTermSelector,
  (templates, type, searchTerm) => {
    return sortBy(
      templates.filter((t) => {
        if (searchTerm && searchTerm.length > 1) {
          return t.name.toLowerCase().includes(searchTerm) && t.type == type
        } else if (type) {
          return t.type == type
        } else {
          return true
        }
      }),
      'name'
    )
  }
)

export const isCloudFileSelector = createSelector(
  projectSelector,
  isOnWebSelector,
  (project, isOnWeb) => {
    return isOnWeb || (project && project.fileURL && urlPointsToPlottrCloud(project.fileURL))
  }
)

export const canSaveSelector = createSelector(
  fileURLSelector,
  isResumingSelector,
  isOfflineSelector,
  offlineModeEnabledSelector,
  hasAllKeysSelector,
  isCloudFileSelector,
  (fileURL, isResuming, isOffline, offlineModeEnabled, hasAllKeys, isCloudFile) => {
    return (
      !!fileURL &&
      !isResuming &&
      (!isCloudFile || !(isCloudFile && isOffline && !offlineModeEnabled)) &&
      hasAllKeys
    )
  }
)
export const canBackupSelector = createSelector(
  fileURLSelector,
  isResumingSelector,
  isOfflineSelector,
  offlineModeEnabledSelector,
  hasAllKeysSelector,
  isCloudFileSelector,
  localBackupsEnabledSelector,
  backupEnabledSelector,
  (
    fileURL,
    isResuming,
    isOffline,
    offlineModeEnabled,
    hasAllKeys,
    isCloudFile,
    localBackupsEnabled,
    backupEnabled
  ) => {
    return (
      backupEnabled &&
      !!fileURL &&
      !isResuming &&
      !(isOffline && isCloudFile) &&
      ((isCloudFile && localBackupsEnabled) || !isCloudFile) &&
      hasAllKeys
    )
  }
)
export const shouldSaveOfflineFileSelector = createSelector(
  canSaveSelector,
  offlineModeEnabledSelector,
  isCloudFileSelector,
  (canSave, offlineModeEnabled, isCloudFile) => {
    return isCloudFile && canSave && offlineModeEnabled
  }
)

export const isInTrialModeWithExpiredTrialSelector = createSelector(
  trialExpiredSelector,
  hasLicenseSelector,
  hasProSelector,
  (trialExpired, hasLicense, hasCurrentProLicense) => {
    return trialExpired && !hasLicense && !hasCurrentProLicense
  }
)

export const characterAttributeTabSelector = createSelector(
  selectedCharacterAttributeTabSelector,
  showBookTabsSelector,
  (selectedTab, showTabs) => {
    return !showTabs ? 'all' : selectedTab
  }
)

// This selector produces a character with overridden attributes based
// on the book we're looking at.
export const displayedSingleCharacterSelector = createSelector(
  singleCharacterSelector,
  characterAttributeTabSelector,
  characterAttributsForBookByIdSelector,
  displayedSingleCharacter
)

export const allDisplayedCharactersSelector = createSelector(
  allCharactersSelector,
  characterAttributeTabSelector,
  characterAttributsForBookByIdSelector,
  overriddenBookIdSelector,
  (characters, bookId, currentBookAttributeDescirptorsById, overridenBookId) => {
    return characters.map((character) =>
      displayedSingleCharacter(
        character,
        overridenBookId || bookId,
        currentBookAttributeDescirptorsById
      )
    )
  }
)

export const allDisplayedCharactersForCurrentBookSelector = createSelector(
  allDisplayedCharactersSelector,
  characterAttributeTabSelector,
  overriddenBookIdSelector,
  (characters, selectedBookId, overriddenBookId) => {
    const bookId = overriddenBookId || selectedBookId || 'series'
    if (bookId === 'all' || bookId === 'series') {
      return characters
    }

    return characters.filter((character) => {
      return character.bookIds.indexOf(bookId) > -1
    })
  }
)

export const displayedCharactersByCategorySelector = createSelector(
  allDisplayedCharactersSelector,
  (characters) => groupBy(characters, 'categoryId')
)

export const characterTemplateAttributeValueSelector =
  (characterId, templateId, attributeName) => (state) => {
    const bookId = characterAttributeTabSelector(state)
    const character = singleCharacterSelector(state, characterId)
    const templateOnCharacter = character && character.templates.find(({ id }) => id === templateId)
    const valueInAttributes =
      templateOnCharacter &&
      templateOnCharacter.attributes.find(({ name }) => name === attributeName).value
    const valueOnTemplate = templateOnCharacter && templateOnCharacter[attributeName]
    const valueForBook =
      templateOnCharacter.values &&
      templateOnCharacter.values.find((value) => {
        return value.name === attributeName && value.bookId === bookId
      })?.value
    return valueForBook || (bookId === 'all' && (valueInAttributes || valueOnTemplate))
  }

const stringifiedCharactersByIdSelector = createSelector(allCharactersSelector, (characters) => {
  return characters.reduce((acc, nextCharacter) => {
    return {
      ...acc,
      [nextCharacter.id]: JSON.stringify(nextCharacter).toLowerCase(),
    }
  }, {})
})

function sortEachCategory(visibleByCategory, sort) {
  let sortOperands = sort.split('~')
  let attrName = sortOperands[0]
  let direction = sortOperands[1]
  let sortByOperand = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']

  Object.keys(visibleByCategory).forEach((k) => {
    let entities = visibleByCategory[k]

    let sorted = sortBy(entities, sortByOperand)
    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}

export const visibleSortedCharactersByCategorySelector = createSelector(
  allDisplayedCharactersSelector,
  displayedCharactersByCategorySelector,
  characterFilterSelector,
  characterFilterIsEmptySelector,
  characterSortSelector,
  characterAttributesForCurrentBookSelector,
  characterAttributeTabSelector,
  (allCharacters, charactersByCategory, filter, filterIsEmpty, sort, allAttributes, bookId) => {
    if (!allCharacters.length) return {}

    let visible = charactersByCategory
    if (!filterIsEmpty) {
      visible = {}
      allCharacters.forEach((ch) => {
        const matches = Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return ch.tags.includes(val)
            }
            if (attr == 'book') {
              return ch.bookIds.includes(val)
            }
            if (attr == 'category') {
              return ch.categoryId == val
            }

            // It could be a new attribute
            const characterAttributes = ch.attributes || []
            const attributeFound = characterAttributes.find((attribute) => {
              return attribute?.id?.toString() === attr && attribute.bookId === bookId
            })
            const definesAttribute =
              attributeFound?.value === val ||
              (attributeFound && attributeFound.value === undefined && val === '')
            if (definesAttribute) {
              return true
            }

            // Or it could be a legacy attribute
            if (!attributeFound) {
              if (val == '') {
                if (!ch[attr] || ch[attr] == '') return true
              } else {
                if (ch[attr] && ch[attr] == val) return true
              }
            }

            return false
          })
        })
        if (matches) {
          if (visible[ch.categoryId] && visible[ch.categoryId].length) {
            visible[ch.categoryId].push(ch)
          } else {
            visible[ch.categoryId] = [ch]
          }
        }
      })
    } else {
      visible = mapValues(visible, (ch) => {
        return ch.filter((c) => bookId === 'all' || c.bookIds.includes(bookId))
      })
    }

    return sortEachCategory(visible, sort)
  }
)

export const visibleSortedSearchedCharactersByCategorySelector = createSelector(
  visibleSortedCharactersByCategorySelector,
  charactersSearchTermSelector,
  stringifiedCharactersByIdSelector,
  (characterCategories, searchTerm, stringifiedCharacters) => {
    if (!searchTerm) return characterCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(characterCategories).reduce((acc, nextCategory) => {
      const [key, characters] = nextCategory
      const newCharacters = characters.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedCharacters[id])
      })
      if (newCharacters.length > 0) {
        return {
          ...acc,
          [key]: newCharacters,
        }
      } else {
        return acc
      }
    }, {})
  }
)

const combinedAttributesForCharacter = (
  character,
  attributes,
  customAttributes,
  selectedBookId,
  overridenBookId,
  order
) => {
  const characterBookAttributes = character.attributes || []
  const allAttributes = attributes.characters || []
  const bookId = overridenBookId || selectedBookId
  const newAttributes = allAttributes
    .filter((bookAttribute) => {
      return bookAttribute.type !== 'base-attribute'
    })
    .map((bookAttribute) => {
      const value = characterBookAttributes.find((attributeValue) => {
        return attributeValue.id === bookAttribute.id && attributeValue.bookId === bookId
      })
      return {
        value: '',
        ...bookAttribute,
        ...value,
      }
    })

  const legacyAttributes = customAttributes.map((customAttribute) => {
    const value = character[customAttribute.name] || ''
    return {
      ...customAttribute,
      value,
    }
  })

  const ordered = order.map((entry) => {
    if (entry.type === 'attributes') {
      return newAttributes.find(({ id }) => {
        return id === entry.id
      })
    } else {
      return legacyAttributes.find(({ name }) => {
        return name === entry.name
      })
    }
  })
  const missing = differenceWith([...newAttributes, ...legacyAttributes], ordered, isEqual)

  return [...ordered, ...missing]
}

export const characterAttributesSelector = createSelector(
  singleCharacterSelector,
  attributesSelector,
  characterCustomAttributesSelector,
  characterAttributeTabSelector,
  overriddenBookIdSelector,
  characterCustomAttributeOrderSelector,
  combinedAttributesForCharacter
)

export const characterAttributeValuesForCurrentBookSelector = createSelector(
  allCharactersSelector,
  attributesSelector,
  characterCustomAttributesSelector,
  characterAttributeTabSelector,
  characterCustomAttributeOrderSelector,
  (characters, attributes, customAttributes, bookId, order) => {
    const newAttributeValues = characters.reduce((acc, character) => {
      const attributesForCharacter = combinedAttributesForCharacter(
        character,
        attributes,
        customAttributes,
        bookId,
        null,
        order
      )
      attributesForCharacter.forEach((attribute) => {
        if (attribute.value !== undefined && attribute.value !== null && attribute.value !== '') {
          if (!Array.isArray(acc[attribute.id])) {
            acc[attribute.id] = [attribute.value]
          }
          acc[attribute.id].push(attribute.value)
          acc[attribute.id] = uniq(acc[attribute.id])
        }
      })
      return acc
    }, {})

    const legacyAttributes = customAttributes.reduce((acc, customAttribute) => {
      const values = characters
        .map((character) => {
          return character[customAttribute.name]
        })
        .filter((value) => {
          return value !== undefined && value !== null && value !== ''
        })
      return {
        ...acc,
        [customAttribute.name]: uniq(values),
      }
    }, {})

    return {
      ...newAttributeValues,
      ...legacyAttributes,
    }
  }
)

export const allBooksWithCharactersInThemSelector = createSelector(
  allBooksSelector,
  allCharactersSelector,
  showBookTabsSelector,
  (books, characters, showBookTabs) => {
    if (!showBookTabs) {
      return omit(books, 'allIds')
    }

    return Object.values(books)
      .filter((value) => {
        return characters.some((character) => {
          return character.bookIds.indexOf(value.id) !== -1
        })
      })
      .reduce((acc, next) => {
        return {
          ...acc,
          [next.id]: next,
        }
      }, {})
  }
)

export const characterFilterIsEmptySelector = createSelector(
  characterFilterSelector,
  characterAttributesForCurrentBookSelector,
  (filter, attributes) => {
    if (!filter) return true
    const allAttributes = [{ name: 'tag' }, { name: 'book' }, { name: 'category' }, ...attributes]
    return !allAttributes.some((attr) => {
      const key = attr.id || attr.name
      return filter[key] && filter[key].length
    })
  }
)

// you can change a paragraph type back to text if:
// 1. It has no value
// 2. It is a string
// 3. It's value is the same as RCE_INITIAL_VALUE
// 4. It's value is an empty paragraph
// Otherwise, a paragraph type can not be changed back
function hasNoLegacyValue(item, attr) {
  const val = item[attr]
  if (!val) return true
  if (typeof val === 'string') return true

  if (!val.length) return true
  if (val.length > 1) return false // more than 1 paragraph
  if (val[0].children) {
    if (val[0].children.length > 1) return false // more than 1 text node
    if (val[0].children[0].text == '') return true // no text
  }
  return false
}

const noEntityHasLegacyAttributeBound = (entities, attrs) => {
  return attrs.reduce((acc, attr) => {
    if (attr.type == 'text') {
      acc.push(attr.name)
      return acc
    }

    const changeable = entities.every((ch) => hasNoLegacyValue(ch, attr.name))
    if (changeable) acc.push(attr.name)
    return acc
  }, [])
}

// you can change a paragraph type back to text if:
// 1. It has no value
// 2. It is a string
// 3. It's value is the same as RCE_INITIAL_VALUE
// 4. It's value is an empty paragraph
// Otherwise, a paragraph type can not be changed back
function hasNoValue(item, id) {
  const attributeValues = item.attributes || []
  const val = attributeValues.find((item) => {
    return item.id === id
  })?.value
  if (!val) return true
  if (typeof val === 'string') return true

  if (!val.length) return true
  if (val.length > 1) return false // more than 1 paragraph
  if (val[0].children.length > 1) return false // more than 1 text node
  if (val[0].children[0].text == '') return true // no text
  return false
}

const noEntityHasAttributeBound = (entities, attrs) => {
  return attrs.reduce((acc, attr) => {
    if (attr.type === 'base-attribute') {
      return acc
    }

    if (attr.type == 'text') {
      acc.push(attr.name)
      return acc
    }

    const changeable = entities.every((ch) => hasNoValue(ch, attr.id))
    if (changeable) acc.push(attr.name)
    return acc
  }, [])
}

export const characterCustomAttributesThatCanChangeSelector = createSelector(
  allCharactersSelector,
  characterCustomAttributesSelector,
  attributesSelector,
  (characters, legacyAttributes, attributes) => {
    const characterBookAttributes = attributes.characters || []
    return [
      ...noEntityHasLegacyAttributeBound(characters, legacyAttributes),
      ...noEntityHasAttributeBound(characters, characterBookAttributes),
    ]
  }
)

export const placeCustomAttributesThatCanChangeSelector = createSelector(
  allPlacesSelector,
  placeCustomAttributesSelector,
  noEntityHasLegacyAttributeBound
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

const visibleBeatsByPosition = (beats, beatHierarchyIsOn, timelineViewIsTabbed) =>
  beatsByPosition(({ expanded }) => {
    return expanded || !beatHierarchyIsOn || timelineViewIsTabbed
  })(beats).filter(({ id }) => {
    const maximumDepth = maxDepth(beats)
    const currentDepth = depth(beats, id)
    const beatIsVisible = beatHierarchyIsOn || currentDepth === maximumDepth
    return (
      (timelineViewIsTabbed && currentDepth !== 0 && beatIsVisible) ||
      (!timelineViewIsTabbed && beatIsVisible)
    )
  })

export const visibleSortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  visibleBeatsByPosition
)

export const firstVisibleBeatForBookSelector = createSelector(
  allBeatsSelector,
  bookIdSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  (beats, bookId, beatHierarchyIsOn, timelineIsTabbed) => {
    const firstVisibleBeat = visibleBeatsByPosition(
      beats[bookId],
      beatHierarchyIsOn,
      timelineIsTabbed
    )[0]
    return firstVisibleBeat
  }
)

export const visibleBeatPositions = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  (beats, beatHierarchyIsOn, timelineViewIsTabbed) => {
    let lastRootIndex = 0
    let lastParentNodeId = null
    const reducer = timelineViewIsTabbed
      ? (acc, beat, index) => {
          const rootParentNodeId = rootParentId(beats, beat.id)
          if (lastParentNodeId !== rootParentNodeId) {
            lastRootIndex = index
            lastParentNodeId = rootParentNodeId
          }
          return {
            ...acc,
            [beat.id]: index - lastRootIndex,
          }
        }
      : (acc, beat, index) => {
          return {
            ...acc,
            [beat.id]: index,
          }
        }
    return visibleBeatsByPosition(beats, beatHierarchyIsOn, timelineViewIsTabbed).reduce(
      reducer,
      {}
    )
  }
)

// This version ignores the view that the timeline is on so it's intended for the *Outline*.
export const sparceBeatMap = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  (beats, beatHierarchyIsOn) =>
    visibleBeatsByPosition(beats, beatHierarchyIsOn, false).reduce((acc, beat, index) => {
      acc[index] = beat.id
      return acc
    }, {})
)

export const topTierBeatsInThreeTierArrangementSelector = createSelector(
  sortedHierarchyLevels,
  sortedBeatsByBookSelector,
  beatsByBookSelector,
  (hierarchyLevels, sortedBeats, beats) => {
    if (hierarchyLevels.length < 3) {
      return []
    }
    return sortedBeats.filter((beat) => {
      return depth(beats, beat.id) === 0
    })
  }
)

export const secondTierBeatsInAtLeastTwoTierArrangementSelector = createSelector(
  sortedHierarchyLevels,
  sortedBeatsByBookSelector,
  beatsByBookSelector,
  topTierBeatsInThreeTierArrangementSelector,
  (hierarchyLevels, sortedBeats, beats, topTierBeats) => {
    if (hierarchyLevels.length < 2) {
      return []
    }
    return sortedBeats
      .filter((beat) => {
        const currentDepth = depth(beats, beat.id)
        return (
          (hierarchyLevels.length === 3 && currentDepth === 1) ||
          (hierarchyLevels.length === 2 && currentDepth === 0)
        )
      })
      .flatMap((beat) => {
        const currentDepth = depth(beats, beat.id)
        // Beat must be at the right level.
        if (currentDepth === 0) {
          return [beat]
        }
        const beatParent = nodeParent(beats, beat.id)
        const indexOfParentInParents = topTierBeats.findIndex(({ id }) => {
          return id === beatParent
        })
        // There must be a parent beat for this beat, that's not in position zero
        if (indexOfParentInParents > 0) {
          // How many palceholders do we add?
          //  - Count the number of beats at the parent level of the current
          //    beat that have no children.
          let furthestIndexBackwardOfParentWithNoChildren
          for (
            furthestIndexBackwardOfParentWithNoChildren = indexOfParentInParents - 1;
            furthestIndexBackwardOfParentWithNoChildren > 0;
            furthestIndexBackwardOfParentWithNoChildren--
          ) {
            const priorParent = topTierBeats[furthestIndexBackwardOfParentWithNoChildren]
            const childrenOfPriorParent = children(beats, priorParent.id)
            // This is the furthest beat back that has children
            if (childrenOfPriorParent.length > 0) {
              break
            }
          }
          // If there was a beat with no children, then it was one
          // beat along.
          furthestIndexBackwardOfParentWithNoChildren++
          if (furthestIndexBackwardOfParentWithNoChildren < indexOfParentInParents) {
            // Insert placeholders for all of the missing beats
            return [
              ...times(indexOfParentInParents - furthestIndexBackwardOfParentWithNoChildren, () => {
                return {
                  type: 'insert-placeholder',
                }
              }),
              beat,
            ]
          }
          return [beat]
        }
        return [beat]
      })
  }
)

export const makeBeatTitleSelector = () =>
  createSelector(
    beatIndexSelector,
    beatsByBookSelector,
    beatIdSelector,
    sortedHierarchyLevels,
    positionOffsetSelector,
    beatHierarchyIsOn,
    isSeriesSelector,
    (beatIndex, beats, beatId, hierarchyLevels, positionOffset, hierarchyEnabled, isSeries) => {
      const beat = findNode(beats, beatId)
      if (!beat) return ''
      return beatTitle(
        beatIndex,
        beats,
        beat,
        hierarchyLevels,
        positionOffset,
        hierarchyEnabled,
        isSeries
      )
    }
  )

export const timelineTabsSelector = createSelector(
  beatsByBookSelector,
  sortedBeatsByBookSelector,
  sortedHierarchyLevels,
  skipPrologueSelector,
  (beats, sortedBeats, hierarchyLevels, skipPrologue) => {
    const atTopLevel = (beat) => {
      const currentDepth = depth(beats, beat.id)
      return currentDepth === 0
    }
    return beatsByPosition(atTopLevel)(beats)
      .filter(atTopLevel)
      .map((beat) => {
        const positionOffset = skipPrologue ? -1 : 0
        const hierarchyEnabled = true
        const isSeries = true
        const beatNode = findNode(beats, beat.id)
        const beatIndex = numberOfPriorChildrenAtSameDepth(beats, sortedBeats, beat.id)
        return beatTitle(
          beatIndex,
          beats,
          beatNode,
          hierarchyLevels,
          positionOffset,
          hierarchyEnabled,
          isSeries
        )
      })
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

export const visibleSortedPlacesSelector = createSelector(
  allPlacesSelector,
  placeFilterSelector,
  placeFilterIsEmptySelector,
  placeSortSelector,
  (allPlaces, filter, filterIsEmpty, sort) => {
    if (!allPlaces.length) return []

    let visible = allPlaces
    if (!filterIsEmpty) {
      visible = []
      visible = allPlaces.filter((pl) => {
        return Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return pl.tags.includes(val)
            }
            if (attr == 'book') {
              return pl.bookIds.includes(val)
            }
            if (val == '') {
              if (!pl[attr] || pl[attr] == '') return true
            } else {
              if (pl[attr] && pl[attr] == val) return true
            }
            return false
          })
        })
      })
    }

    let sortOperands = sort.split('~')
    let attrName = sortOperands[0]
    let direction = sortOperands[1]
    let sortOperand = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']
    let sorted = sortBy(visible, sortOperand)
    if (direction == 'desc') sorted.reverse()
    return sorted
  }
)

export const visibleSortedPlacesByCategorySelector = createSelector(
  allPlacesSelector,
  placesByCategorySelector,
  placeFilterSelector,
  placeFilterIsEmptySelector,
  placeSortSelector,
  (allPlaces, placesByCategory, filter, filterIsEmpty, sort) => {
    if (!allPlaces.length) return {}

    let visible = placesByCategory
    if (!filterIsEmpty) {
      visible = {}
      allPlaces.forEach((ch) => {
        const matches = Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return ch.tags.includes(val)
            }
            if (attr == 'book') {
              return ch.bookIds.includes(val)
            }
            if (attr == 'category') {
              return ch.categoryId == val
            }
            if (val == '') {
              if (!ch[attr] || ch[attr] == '') return true
            } else {
              if (ch[attr] && ch[attr] == val) return true
            }
            return false
          })
        })
        if (matches) {
          if (visible[ch.categoryId] && visible[ch.categoryId].length) {
            visible[ch.categoryId].push(ch)
          } else {
            visible[ch.categoryId] = [ch]
          }
        }
      })
    }

    return sortEachCategory(visible, sort)
  }
)

export const visibleSortedSearchedPlacesByCategorySelector = createSelector(
  visibleSortedPlacesByCategorySelector,
  placesSearchTermSelector,
  stringifiedPlacesByIdSelector,
  (placeCategories, searchTerm, stringifiedPlaces) => {
    if (!searchTerm) return placeCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(placeCategories).reduce((acc, nextCategory) => {
      const [key, places] = nextCategory
      const newPlaces = places.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedPlaces[id])
      })
      if (newPlaces.length > 0) {
        return {
          ...acc,
          [key]: newPlaces,
        }
      } else {
        return acc
      }
    }, {})
  }
)

export const placesSortedInBookSelector = createSelector(
  placesSortedAtoZSelector,
  currentTimelineSelector,
  (places, bookId) =>
    places.filter((place) => {
      if (place.bookIds.length === 0) return true
      if (place.bookIds.some(isSeries)) return true
      return place.bookIds.includes(bookId)
    })
)

export const characterAttributesForCurrentBookSelector = createSelector(
  attributesSelector,
  characterCustomAttributesSelector,
  selectedCharacterAttributeTabSelector,
  characterCustomAttributeOrderSelector,
  (attributes, legacyAttributes, bookId, order) => {
    const bookAttributes = (attributes && attributes.characters) || []
    const newAttributes = bookAttributes.filter((attribute) => {
      return attribute.type !== 'base-attribute'
    })
    const ordered = order.map((entry) => {
      if (entry.type === 'attributes') {
        return newAttributes.find(({ id }) => {
          return id === entry.id
        })
      } else {
        return legacyAttributes.find(({ name }) => {
          return name === entry.name
        })
      }
    })
    const missing = differenceWith([...newAttributes, ...legacyAttributes], ordered, isEqual)
    return [...ordered, ...missing]
  }
)

export const searchedTagsByCategorySelector = createSelector(
  tagsByCategorySelector,
  tagsSearchTermSelector,
  stringifiedTagsByIdSelector,
  (tagCategories, searchTerm, stringifiedTags) => {
    if (!searchTerm) return tagCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(tagCategories).reduce((acc, nextCategory) => {
      const [key, notes] = nextCategory
      const newNotes = notes.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedTags[id])
      })
      if (newNotes.length > 0) {
        return {
          ...acc,
          [key]: newNotes,
        }
      } else {
        return acc
      }
    }, {})
  }
)

export const beatsByBookSelector = createSelector(
  allBeatsSelector,
  currentTimelineSelector,
  (beats, bookId) => {
    return beats[bookId]
  }
)

export const sortedBeatsByBookSelector = createSelector(
  beatsByBookSelector,
  beatsByPosition(() => true)
)

export const visibleSortedBeatsByBookIgnoringCollapsedSelector = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  visibleBeatsByPositionIgnoringCollapsed
)

export const skipPrologueSelector = createSelector(sortedBeatsByBookSelector, (beats) =>
  beatOneIsPrologue(beats)
)

export const positionOffsetSelector = createSelector(skipPrologueSelector, (skip) =>
  skip ? -1 : 0
)

export const makeBeatSelector = () => createSelector(beatsByBookSelector, beatIdSelector, findNode)

export const beatHasChildrenSelector = createSelector(beatsByBookSelector, (beats) => {
  return reduce('id')(
    beats,
    (beatsHaveChildren, beat) => {
      beatsHaveChildren.set(beat.id, children(beats, beat.id).length > 0)
      return beatsHaveChildren
    },
    new Map()
  )
})

export const beatIndexSelector = createSelector(
  beatsByBookSelector,
  sortedBeatsByBookSelector,
  beatIdSelector,
  numberOfPriorChildrenAtSameDepth
)

export const timelineTabBeatIdsSelector = createSelector(beatsByBookSelector, (beats) => {
  const atTopLevel = (beat) => {
    const currentDepth = depth(beats, beat.id)
    return currentDepth === 0
  }
  return beatsByPosition(atTopLevel)(beats)
    .filter(atTopLevel)
    .map((beat) => {
      return beat.id
    })
})

export const timelineActiveTabSelector = createSelector(
  timelineSelectedTabSelector,
  timelineTabBeatIdsSelector,
  (tab, tabBeatIds) => {
    if (tabBeatIds.indexOf(tab) !== -1) {
      return tab
    }
    return tabBeatIds[0]
  }
)

export const visibleSortedBeatsForTimelineByBookSelector = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  timelineActiveTabSelector,
  timelineViewIsStackedSelector,
  isSmallSelector,
  visibleBeatsByPositionForTimeline
)

export const timelineSparceBeatMap = createSelector(
  beatsByBookSelector,
  beatHierarchyIsOn,
  timelineViewIsTabbedSelector,
  timelineActiveTabSelector,
  timelineViewIsStackedSelector,
  isSmallSelector,
  (beats, beatHierarchyIsOn, timelineViewIsTabbed, activeTab, timelineViewIsStacked, isSmall) => {
    const activeParentId = activeTab

    return visibleBeatsForTopLevelParentByPosition(
      beats,
      beatHierarchyIsOn,
      timelineViewIsTabbed,
      activeParentId,
      timelineViewIsStacked,
      isSmall
    ).reduce((acc, beat, index) => {
      acc[index] = beat.id
      return acc
    }, {})
  }
)

export const leavesPerBeatSelector = createSelector(beatsByBookSelector, (beats) => {
  const index = new Map()
  const leavesForBeat = (id) => {
    const currentCount = index.get(id)
    if (currentCount) {
      return currentCount
    }

    const nodeChildren = children(beats, id)
    if (nodeChildren.length === 0) {
      return 1
    }

    return nodeChildren
      .map(({ id }) => id)
      .map(leavesForBeat)
      .reduce((acc, childCount) => {
        return acc + childCount
      }, 0)
  }

  forEach(beats, ({ id }) => {
    index.set(id, leavesForBeat(id))
  })
  return index
})

export const allNotesInBookSelector = createSelector(
  allNotesSelector,
  currentTimelineSelector,
  (notes, bookId) =>
    notes.filter((note) => {
      if (note.bookIds.length === 0) return true
      if (note.bookIds.some(isSeries)) return true
      return note.bookIds.includes(bookId)
    })
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

export const visibleSortedNotesByCategorySelector = createSelector(
  allNotesSelector,
  notesByCategorySelector,
  noteFilterSelector,
  noteFilterIsEmptySelector,
  noteSortSelector,
  (allNotes, notesByCategory, filter, filterIsEmpty, sort) => {
    if (!allNotes.length) return {}

    let visible = notesByCategory
    if (!filterIsEmpty) {
      visible = {}
      allNotes.forEach((n) => {
        const matches = Object.keys(filter).some((attr) => {
          return filter[attr].some((val) => {
            if (attr == 'tag') {
              return n.tags.includes(val)
            }
            if (attr == 'character') {
              return n.characters.includes(val)
            }
            if (attr == 'book') {
              return n.bookIds.includes(val)
            }
            if (attr == 'noteCategory') {
              return n.categoryId == val
            }
            if (attr == 'place') {
              return n.places.includes(val)
            }
            if (val == '') {
              if (!n[attr] || n[attr] == '') return true
            } else {
              if (n[attr] && n[attr] == val) return true
            }
            return false
          })
        })
        if (matches) {
          const categoryId = n.categoryId === undefined ? null : n.categoryId
          if (visible[categoryId] && visible[categoryId].length) {
            visible[categoryId].push(n)
          } else {
            visible[categoryId] = [n]
          }
        }
      })
      if (visible[undefined] !== undefined) {
        visible[null] = visible[undefined]
        delete visible[undefined]
      }
    }

    return sortEachCategory(visible, sort)
  }
)

export const visibleSortedSearchedNotesByCategorySelector = createSelector(
  visibleSortedNotesByCategorySelector,
  notesSearchTermSelector,
  stringifiedNotesByIdSelector,
  (noteCategories, searchTerm, stringifiedNotes) => {
    if (!searchTerm) return noteCategories

    const lowSearchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((x) => x)
    return Object.entries(noteCategories).reduce((acc, nextCategory) => {
      const [key, notes] = nextCategory
      const newNotes = notes.filter(({ id }) => {
        return outOfOrderSearch(lowSearchTerms, stringifiedNotes[id])
      })
      if (newNotes.length > 0) {
        return {
          ...acc,
          [key]: newNotes,
        }
      } else {
        return acc
      }
    }, {})
  }
)

export const charactersSortedInBookSelector = createSelector(
  charactersSortedAtoZSelector,
  currentTimelineSelector,
  (characters, bookId) =>
    characters.filter((character) => {
      if (character.bookIds.length === 0) return true
      if (character.bookIds.some(isSeries)) return true
      return character.bookIds.includes(bookId)
    })
)

export const characterBookCategoriesSelector = createSelector(
  currentTimelineSelector,
  allCharactersSelector,
  (bookId, characters) => {
    const categoryMembership = characters.reduce((acc, character) => {
      if (character.bookIds.indexOf(bookId) > -1) {
        return {
          ...acc,
          'Characters In Book': [character.id, ...(acc['Characters In Book'] || [])],
        }
      }

      return {
        ...acc,
        'Not in Book': [character.id, ...(acc['Not in Book'] || [])],
      }
    }, {})
    return [
      categoryMembership['Characters In Book']?.length > 0
        ? [
            {
              displayHeading: false,
              key: 'Characters In Book',
              'Characters In Book': categoryMembership['Characters In Book'],
            },
          ]
        : [],
      categoryMembership['Not in Book']?.length > 0
        ? [
            {
              glyph: 'plus',
              displayHeading: true,
              key: 'Not in Book',
              'Not in Book': categoryMembership['Not in Book'],
              lineAbove: true,
            },
          ]
        : [],
    ].flatMap((x) => x)
  }
)

const levels = (state) => state.hierarchyLevels

export const hierarchyLevels = createSelector(
  levels,
  currentTimelineSelector,
  (allLevels, timeline) => {
    return allLevels[timeline]
  }
)

export const hierarchyLevelCount = createSelector(
  hierarchyLevels,
  (hierarchyLevels) => Object.keys(hierarchyLevels).length
)

export const sortedHierarchyLevels = createSelector(
  hierarchyLevelCount,
  hierarchyLevels,
  (levels, hierarchyLevels) => {
    const sortedLevels = []
    for (let i = 0; i < levels; ++i) {
      sortedLevels.push(hierarchyLevels[i])
    }
    return sortedLevels
  }
)

export const topLevelBeatNameSelector = createSelector(sortedHierarchyLevels, (levels) => {
  return levels[0].name
})
