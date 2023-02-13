import { omit } from 'lodash'

import { configureStore } from './fixtures/testStore'
import {
  goldilocks,
  hamlet,
  hamlet_with_attribute_mix,
  hamlet_with_partial_attr_ordering,
} from './fixtures'
import { emptyFile } from '../../store/newFileState'
import { uiState } from '../../store/initialState'
import { changeOrientation, loadFile, setCharacterFilter } from '../../actions/ui'
import { deleteCharacterAttribute, editCharacterAttributeMetadata } from '../../actions/attributes'
import { addCard, addCharacter as addCharacterToCard, moveCardToBook } from '../../actions/cards'
import { addCharacter, editCharacterAttributeValue } from '../../actions/characters'
import { setAppSettings } from '../../actions/settings'
import { setPermission } from '../../actions/permission'
import {
  permissionSelector,
  currentTimelineSelector,
  isCardDialogVisibleSelector,
  stickyHeaderCountSelector,
  stickyLeftColumnCountSelector,
  sortedLinesByBookSelector,
  orientationSelector,
} from '../../selectors'
import { changeCurrentTimeline, setCardDialogOpen } from '../../actions/ui'
import { addBook } from '../../actions/books'
import { setUserId } from '../../actions/client'
import { addLineWithTitle, togglePinPlotline } from '../../actions/lines'

const EMPTY_FILE = emptyFile('Test file')
const initialStore = () => {
  const store = configureStore()
  store.dispatch(
    loadFile(
      'Test file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device://tmp/dummy-url-test-file.pltr'
    )
  )
  return store
}

describe('loadFile', () => {
  describe('given the empty file state', () => {
    it('should include an empty attribute ordering', () => {
      const store = initialStore()
      expect(store.getState().present.ui.customAttributeOrder).toEqual({
        characters: [],
      })
    })
  })
  describe('given a file with one legacy attribute', () => {
    describe('and no ordering for that attribute', () => {
      it('should add a singleton ordering', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Goldilocks',
            false,
            goldilocks,
            goldilocks.file.version,
            'device://tmp/dummy-goldilocks.pltr'
          )
        )
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              type: 'customAttributes',
              name: 'Species',
            },
          ],
        })
      })
    })
  })
  describe('given a file with multiple legacy character custom attributes', () => {
    describe('and no ordering for those attributes', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Hamlet', false, hamlet, hamlet.file.version, 'device://tmp/dummy-hamlet.pltr')
        )
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              name: 'Role',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
            {
              name: 'Royal Family Member',
              type: 'customAttributes',
            },
            {
              name: 'Characters That Die',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
  })
  describe('given a file with a mix of legacy and new character custom attributes', () => {
    describe('and no ordering for those attributes', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            hamlet_with_attribute_mix,
            hamlet_with_attribute_mix.file.version,
            'device://tmp/dummy-hamlet.pltr'
          )
        )
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              id: 1,
              type: 'attributes',
            },
            {
              id: 2,
              type: 'attributes',
            },
            {
              name: 'Role',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
    describe('and a partial ordering for those attributes (i.e. the ordering lacks some attributes)', () => {
      it('should create an ordering for the attributes', () => {
        const store = initialStore()
        store.dispatch(
          loadFile(
            'Hamlet',
            false,
            hamlet_with_partial_attr_ordering,
            hamlet_with_partial_attr_ordering.file.version,
            'device://tmp/dummy-hamlet.pltr'
          )
        )
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              id: 1,
              type: 'attributes',
            },
            {
              name: 'Role',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
            {
              id: 2,
              type: 'attributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
  })
})

describe('editAttributeMetadata', () => {
  describe('given a state with legacy attributes', () => {
    describe('when editing the name of a legacy attribute', () => {
      it('should update the order entry to reflect the name change', () => {
        const store = initialStore()
        store.dispatch(
          loadFile('Hamlet', false, hamlet, hamlet.file.version, 'device://tmp/dummy-hamlet.pltr')
        )
        store.dispatch(editCharacterAttributeMetadata(null, 'New Name', 'paragraph', 'Role'))
        expect(store.getState().present.ui.customAttributeOrder).toEqual({
          characters: [
            {
              name: 'New Name',
              type: 'customAttributes',
            },
            {
              name: 'Motivation',
              type: 'customAttributes',
            },
            {
              name: 'Gender',
              type: 'customAttributes',
            },
            {
              name: 'Fatal Flaws',
              type: 'customAttributes',
            },
            {
              name: 'Inner Conflict',
              type: 'customAttributes',
            },
            {
              name: 'How They Die',
              type: 'customAttributes',
            },
            {
              name: 'Attended Wittenberg',
              type: 'customAttributes',
            },
            {
              name: 'Royal Family Member',
              type: 'customAttributes',
            },
            {
              name: 'Characters That Die',
              type: 'customAttributes',
            },
          ],
        })
      })
    })
  })
})

describe('deleteCharacterAttribute', () => {
  describe('given a state with a character', () => {
    describe('and a custom attribute with a value', () => {
      describe('and a ui filter for the value of that atribute', () => {
        it('should remove the ui filter', () => {
          const store = initialStore()
          store.dispatch(addCharacter('John Doe'))
          store.dispatch(addCharacterToCard(1, 1))
          store.dispatch(editCharacterAttributeValue(1, 1, 'blah'))
          store.dispatch(
            setCharacterFilter({
              1: ['blah'],
            })
          )
          expect(store.getState().present.ui.characterFilter).toEqual({
            1: ['blah'],
          })
          store.dispatch(deleteCharacterAttribute(1))
          expect(store.getState().present.ui.characterFilter).toEqual({})
        })
      })
    })
  })
})

// TODO:
// - Changes to different uids happen to different records.
describe('ui-per-user', () => {
  describe('given a state in which a user should *not* be logged in to Pro', () => {
    describe('despite what permission is noted', () => {
      it('should write into the root of the ui object', () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: null,
            },
          })
        )
        store.dispatch(setPermission('owner'))
        expect(permissionSelector(store.getState().present)).toEqual('owner')
        const initialUI = store.getState().present.ui
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(store.getState().present.ui.collaborators).toEqual(initialUI.collaborators)
      })
    })
  })
  describe('given a state in which a user *should* be logged in to Pro (and is not)', () => {
    describe('and no permission is noted', () => {
      it(`should not write into the ui key (because we're waiting for permissions)`, () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission(null))
        expect(permissionSelector(store.getState().present)).toEqual(null)
        const initialUI = store.getState().present.ui
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).toEqual(initialTimeline)
        expect(store.getState().present.ui).toEqual(initialUI)
      })
    })
    describe('and the permission is "owner"', () => {
      it('should write into the root of the ui key', () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission('owner'))
        expect(permissionSelector(store.getState().present)).toEqual('owner')
        const initialUI = store.getState().present.ui
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(store.getState().present.ui.collaborators).toEqual(initialUI.collaborators)
      })
    })
    describe('and the permission is "collaborator"', () => {
      it(`should not write into the ui key (because we don' have a uid yet)`, () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission('collaborator'))
        expect(permissionSelector(store.getState().present)).toEqual('collaborator')
        const initialUI = store.getState().present.ui
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).toEqual(initialTimeline)
        expect(store.getState().present.ui.collaborators).toEqual(initialUI.collaborators)
      })
    })
    describe('and the permission is "viewer"', () => {
      it('should not write into the ui key', () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission('viewer'))
        expect(permissionSelector(store.getState().present)).toEqual('viewer')
        const initialUI = store.getState().present.ui
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).toEqual(initialTimeline)
        expect(store.getState().present.ui.collaborators).toEqual(initialUI.collaborators)
      })
    })
  })
  describe('given a state in which a user is logged in to Pro', () => {
    describe('and no permission is noted', () => {
      it(`should not write into the ui key (because we're waiting for permissions)`, () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setPermission(null))
        expect(permissionSelector(store.getState().present)).toEqual(null)
        const initialUI = store.getState().present.ui
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).toEqual(initialTimeline)
        expect(store.getState().present.ui).toEqual(initialUI)
      })
    })
    describe('and the permission is "owner"', () => {
      it('should write into the root of the ui key', () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('owner'))
        expect(permissionSelector(store.getState().present)).toEqual('owner')
        const initialUI = store.getState().present.ui
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(store.getState().present.ui.collaborators).toEqual(initialUI.collaborators)
      })
    })
    describe('and the permission is "collaborator"', () => {
      it('should write into an entry inside of ui.collaborators.collaborators keyed by the logged-in uid', () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('collaborator'))
        expect(permissionSelector(store.getState().present)).toEqual('collaborator')
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(store.getState().present.ui.collaborators.collaborators).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 3,
          },
        ])
      })
      it('should write subsequent changes into the same entry', () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('collaborator'))
        expect(permissionSelector(store.getState().present)).toEqual('collaborator')
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(store.getState().present.ui.collaborators.collaborators).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 3,
          },
        ])
        store.dispatch(changeCurrentTimeline(2))
        const finalTimeline = currentTimelineSelector(store.getState().present)
        expect(finalTimeline).toEqual(2)
        expect(store.getState().present.ui.collaborators.collaborators).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 2,
          },
        ])
      })
      describe('when the logged-in uid changes', () => {
        it('should write to a new record corresponding to the new uid', () => {
          const store = initialStore()
          const appSettings = store.getState().present.settings.appSettings
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(
            setAppSettings({
              ...appSettings,
              user: {
                ...appSettings.user,
                frbId: 'dummy-id',
              },
            })
          )
          store.dispatch(setUserId('dummy-user-id'))
          store.dispatch(setPermission('collaborator'))
          expect(permissionSelector(store.getState().present)).toEqual('collaborator')
          const initialTimeline = currentTimelineSelector(store.getState().present)
          store.dispatch(changeCurrentTimeline(3))
          const nextTimeline = currentTimelineSelector(store.getState().present)
          expect(nextTimeline).not.toEqual(initialTimeline)
          expect(nextTimeline).toEqual(3)
          expect(store.getState().present.ui.collaborators.collaborators).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
          ])
          store.dispatch(setUserId('dummy-user-id-2'))
          store.dispatch(changeCurrentTimeline(2))
          const finalTimeline = currentTimelineSelector(store.getState().present)
          expect(finalTimeline).toEqual(2)
          expect(store.getState().present.ui.collaborators.collaborators).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id-2',
              currentTimeline: 2,
            },
          ])
        })
      })
      describe('when the permission changes to viewer', () => {
        it('should write to a new record in viewer', () => {
          const store = initialStore()
          const appSettings = store.getState().present.settings.appSettings
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(
            setAppSettings({
              ...appSettings,
              user: {
                ...appSettings.user,
                frbId: 'dummy-id',
              },
            })
          )
          store.dispatch(setUserId('dummy-user-id'))
          store.dispatch(setPermission('collaborator'))
          expect(permissionSelector(store.getState().present)).toEqual('collaborator')
          const initialTimeline = currentTimelineSelector(store.getState().present)
          store.dispatch(changeCurrentTimeline(3))
          const nextTimeline = currentTimelineSelector(store.getState().present)
          expect(nextTimeline).not.toEqual(initialTimeline)
          expect(nextTimeline).toEqual(3)
          expect(store.getState().present.ui.collaborators.collaborators).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
          ])
          store.dispatch(setPermission('viewer'))
          store.dispatch(changeCurrentTimeline(2))
          const finalTimeline = currentTimelineSelector(store.getState().present)
          expect(finalTimeline).toEqual(2)
          expect(store.getState().present.ui.collaborators).toEqual({
            collaborators: [
              {
                ...omit(uiState, 'collaborators'),
                id: 'dummy-user-id',
                currentTimeline: 3,
              },
            ],
            viewers: [
              {
                ...omit(uiState, 'collaborators'),
                id: 'dummy-user-id',
                currentTimeline: 2,
              },
            ],
          })
        })
      })
    })
    describe('and the permission is "viewer"', () => {
      it('should write into an entry inside of ui.collaborators.viewers keyed by the logged-in uid', () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('viewer'))
        expect(permissionSelector(store.getState().present)).toEqual('viewer')
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(store.getState().present.ui.collaborators.viewers).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 3,
          },
        ])
      })
      it('should write subsequent changes into the same entry', () => {
        const store = initialStore()
        const appSettings = store.getState().present.settings.appSettings
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(addBook())
        store.dispatch(
          setAppSettings({
            ...appSettings,
            user: {
              ...appSettings.user,
              frbId: 'dummy-id',
            },
          })
        )
        store.dispatch(setUserId('dummy-user-id'))
        store.dispatch(setPermission('viewer'))
        expect(permissionSelector(store.getState().present)).toEqual('viewer')
        const initialTimeline = currentTimelineSelector(store.getState().present)
        store.dispatch(changeCurrentTimeline(3))
        const nextTimeline = currentTimelineSelector(store.getState().present)
        expect(nextTimeline).not.toEqual(initialTimeline)
        expect(nextTimeline).toEqual(3)
        expect(store.getState().present.ui.collaborators.viewers).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 3,
          },
        ])
        store.dispatch(changeCurrentTimeline(2))
        const finalTimeline = currentTimelineSelector(store.getState().present)
        expect(finalTimeline).toEqual(2)
        expect(store.getState().present.ui.collaborators.viewers).toEqual([
          {
            ...omit(uiState, 'collaborators'),
            id: 'dummy-user-id',
            currentTimeline: 2,
          },
        ])
      })
      describe('when the logged-in uid changes', () => {
        it('should write to a new record corresponding to the new uid', () => {
          const store = initialStore()
          const appSettings = store.getState().present.settings.appSettings
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(addBook())
          store.dispatch(
            setAppSettings({
              ...appSettings,
              user: {
                ...appSettings.user,
                frbId: 'dummy-id',
              },
            })
          )
          store.dispatch(setUserId('dummy-user-id'))
          store.dispatch(setPermission('viewer'))
          expect(permissionSelector(store.getState().present)).toEqual('viewer')
          const initialTimeline = currentTimelineSelector(store.getState().present)
          store.dispatch(changeCurrentTimeline(3))
          const nextTimeline = currentTimelineSelector(store.getState().present)
          expect(nextTimeline).not.toEqual(initialTimeline)
          expect(nextTimeline).toEqual(3)
          expect(store.getState().present.ui.collaborators.viewers).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
          ])
          store.dispatch(setUserId('dummy-user-id-2'))
          store.dispatch(changeCurrentTimeline(2))
          const finalTimeline = currentTimelineSelector(store.getState().present)
          expect(finalTimeline).toEqual(2)
          expect(store.getState().present.ui.collaborators.viewers).toEqual([
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id',
              currentTimeline: 3,
            },
            {
              ...omit(uiState, 'collaborators'),
              id: 'dummy-user-id-2',
              currentTimeline: 2,
            },
          ])
        })
      })
    })
  })
})

const exampleCard1 = {
  title: 'Card 1',
  description: 'Card 1 description',
  lineId: 1,
  beatId: 1,
}

describe('moveCardToBook', () => {
  describe('when a card dialog is open', () => {
    it('should close the card dialog', () => {
      const store = initialStore()
      store.dispatch(addCard(exampleCard1))
      store.dispatch(setCardDialogOpen(1, 1, 1))
      const cardIsOpen = isCardDialogVisibleSelector(store.getState().present)
      expect(cardIsOpen).toBeTruthy()
      store.dispatch(moveCardToBook('series', 1))
      const cardIsOpenAfter = isCardDialogVisibleSelector(store.getState().present)
      expect(cardIsOpenAfter).toBeFalsy()
    })
  })
})

describe('togglePinPlotline horizontal-orientation', () => {
  describe('when there is no plotline pinned yet', () => {
    const store = initialStore()
    const currentBook = 1
    store.dispatch(addLineWithTitle('second line', currentBook))
    store.dispatch(addLineWithTitle('third line', currentBook))
    store.dispatch(addLineWithTitle('fourth line', currentBook))
    const initialState = store.getState().present
    const allLines = sortedLinesByBookSelector(initialState)

    it('should have only have 1 sticky header', () => {
      const stickyHeaderCount = stickyHeaderCountSelector(initialState)
      expect(stickyHeaderCount).toEqual(1)
    })

    it('should have only have 1 sticky left column', () => {
      const stickyHeaderCount = stickyLeftColumnCountSelector(initialState)
      expect(stickyHeaderCount).toEqual(1)
    })

    describe('pin plotline', () => {
      const exampleLine1 = allLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLine1))
      const updatedStateAfterFirstPin = store.getState().present
      it('should add 1 more sticky header', () => {
        const newStickyHeaderCount = stickyHeaderCountSelector(updatedStateAfterFirstPin)
        expect(newStickyHeaderCount).toEqual(2)
      })
      it('should not increase sticky left column count', () => {
        const leftStickyColumnCount = stickyLeftColumnCountSelector(updatedStateAfterFirstPin)
        expect(leftStickyColumnCount).toEqual(1)
      })
      const updatedLines = sortedLinesByBookSelector(updatedStateAfterFirstPin)
      const pinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      it('should position the pinned plotline to top', () => {
        expect(pinnedPlotline.position).toEqual(0)
      })
      it('should have isPinned property', () => {
        expect(pinnedPlotline.isPinned).toBeTruthy()
      })
    })

    describe('pin more plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState().present)
      const exampleLine2 = allLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLine2))
      const updatedStateAfterSecondPin = store.getState().present
      it('should add 1 more sticky header', () => {
        const updatedStickyHeaderCount = stickyHeaderCountSelector(updatedStateAfterSecondPin)
        expect(updatedStickyHeaderCount).toEqual(3)
      })
      it('should not increase/decrease the sticky left column count', () => {
        const newStickyLeftColumnCount = stickyLeftColumnCountSelector(updatedStateAfterSecondPin)
        expect(newStickyLeftColumnCount).toEqual(1)
      })

      const updatedLines = sortedLinesByBookSelector(updatedStateAfterSecondPin)
      const mainPinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      const fourthPinnedPlotline = updatedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      it('should position the new pinned plotline to top', () => {
        expect(fourthPinnedPlotline.position).toEqual(0)
        expect(mainPinnedPlotline.position).toEqual(1)
      })
      it('should have isPinned property for 2 pinned plotlines', () => {
        expect(mainPinnedPlotline.isPinned).toBeTruthy()
        expect(fourthPinnedPlotline.isPinned).toBeTruthy()
      })
    })

    describe('unpin a pinned plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState().present)
      const exampleLineToUnpin = allLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      console.log('exampleLineToUnpin', exampleLineToUnpin)
      store.dispatch(togglePinPlotline(exampleLineToUnpin))
      const stateAfterTogglingAPinnedPlotline = store.getState().present
      const updatedLines = sortedLinesByBookSelector(stateAfterTogglingAPinnedPlotline)

      it('should reduce 1 to sticky header count', () => {
        const updatedStickyHeaderCount = stickyHeaderCountSelector(
          stateAfterTogglingAPinnedPlotline
        )
        expect(updatedStickyHeaderCount).toEqual(2)
      })
      it('should not increase/decrease the sticky left column count', () => {
        const newStickyLeftColumnCount = stickyLeftColumnCountSelector(
          stateAfterTogglingAPinnedPlotline
        )
        expect(newStickyLeftColumnCount).toEqual(1)
      })

      const fourthPinnedPlotline = updatedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      it('should unpin if line is currently pinned', () => {
        expect(fourthPinnedPlotline.isPinned).toBeFalsy()
      })

      const mainPinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )

      it('should position the remaining pinned plotline to top', () => {
        expect(mainPinnedPlotline.position).toEqual(0)
        expect(mainPinnedPlotline.isPinned).toBeTruthy()
      })

      it('should move the newly unpinned plotline to the position next after the last pinned plotline', () => {
        const pinnedPlotlines = updatedLines.filter((line) => line?.isPinned)
        const lastPinned = pinnedPlotlines.reduce((acc, current) =>
          acc.position > current.position ? acc : current
        )
        expect(fourthPinnedPlotline.position).toBe(Number(lastPinned.position) + 1)
      })
    })
  })
})

describe('togglePinPlotline vertical-orientation', () => {
  describe('when there is no plotline pinned yet', () => {
    const store = initialStore()
    const currentBook = 1
    store.dispatch(changeOrientation('vertical'))
    store.dispatch(addLineWithTitle('second line', currentBook))
    store.dispatch(addLineWithTitle('third line', currentBook))
    store.dispatch(addLineWithTitle('fourth line', currentBook))
    const initialState = store.getState().present
    const allLines = sortedLinesByBookSelector(initialState)
    const orientation = orientationSelector(initialState)
    console.log('orientation', orientation)

    it('should have only have 1 sticky header', () => {
      const stickyHeaderCount = stickyHeaderCountSelector(initialState)
      expect(stickyHeaderCount).toEqual(1)
    })

    it('should have only have 1 sticky left column', () => {
      const stickyHeaderCount = stickyLeftColumnCountSelector(initialState)
      expect(stickyHeaderCount).toEqual(1)
    })

    describe('pin plotline', () => {
      const exampleLine1 = allLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLine1))
      const updatedStateAfterFirstPin = store.getState().present
      it('should not increase/decrease sticky header count', () => {
        const newStickyHeaderCount = stickyHeaderCountSelector(updatedStateAfterFirstPin)
        expect(newStickyHeaderCount).toEqual(1)
      })
      it('should add 1 more sticky left column count', () => {
        const leftStickyColumnCount = stickyLeftColumnCountSelector(updatedStateAfterFirstPin)
        expect(leftStickyColumnCount).toEqual(2)
      })
      const updatedLines = sortedLinesByBookSelector(updatedStateAfterFirstPin)
      const pinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      it('should position the pinned plotline to left most', () => {
        expect(pinnedPlotline.position).toEqual(0)
      })
      it('should have isPinned property', () => {
        expect(pinnedPlotline.isPinned).toBeTruthy()
      })
    })

    describe('pin more plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState().present)
      const exampleLine2 = allLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      store.dispatch(togglePinPlotline(exampleLine2))
      const updatedStateAfterSecondPin = store.getState().present
      it('should not increase/decrease sticky header count', () => {
        const updatedStickyHeaderCount = stickyHeaderCountSelector(updatedStateAfterSecondPin)
        expect(updatedStickyHeaderCount).toEqual(1)
      })
      it('should add 1 more sticky left column count', () => {
        const newStickyLeftColumnCount = stickyLeftColumnCountSelector(updatedStateAfterSecondPin)
        expect(newStickyLeftColumnCount).toEqual(3)
      })

      const updatedLines = sortedLinesByBookSelector(updatedStateAfterSecondPin)
      const mainPinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )
      const fourthPinnedPlotline = updatedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      it('should position the new pinned plotline to left most', () => {
        expect(fourthPinnedPlotline.position).toEqual(0)
        expect(mainPinnedPlotline.position).toEqual(1)
      })
      it('should have isPinned property for 2 pinned plotlines', () => {
        expect(mainPinnedPlotline.isPinned).toBeTruthy()
        expect(fourthPinnedPlotline.isPinned).toBeTruthy()
      })
    })

    describe('unpin a pinned plotline', () => {
      const allLines = sortedLinesByBookSelector(store.getState().present)
      const exampleLineToUnpin = allLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      console.log('exampleLineToUnpin', exampleLineToUnpin)
      store.dispatch(togglePinPlotline(exampleLineToUnpin))
      const stateAfterTogglingAPinnedPlotline = store.getState().present
      const updatedLines = sortedLinesByBookSelector(stateAfterTogglingAPinnedPlotline)

      it('should not increase/decrease sticky header count', () => {
        const updatedStickyHeaderCount = stickyHeaderCountSelector(
          stateAfterTogglingAPinnedPlotline
        )
        expect(updatedStickyHeaderCount).toEqual(1)
      })
      it('should reduce 1 to sticky left column count', () => {
        const newStickyLeftColumnCount = stickyLeftColumnCountSelector(
          stateAfterTogglingAPinnedPlotline
        )
        expect(newStickyLeftColumnCount).toEqual(2)
      })

      const fourthPinnedPlotline = updatedLines.find(
        (line) => line.title === 'fourth line' && line.bookId === currentBook
      )
      it('should unpin if line is currently pinned', () => {
        expect(fourthPinnedPlotline.isPinned).toBeFalsy()
      })

      const mainPinnedPlotline = updatedLines.find(
        (line) => line.title === 'Main Plot' && line.bookId === currentBook
      )

      it('should position the remaining pinned plotline to the left most', () => {
        expect(mainPinnedPlotline.position).toEqual(0)
        expect(mainPinnedPlotline.isPinned).toBeTruthy()
      })

      it('should move the newly unpinned plotline to the position next after the last pinned plotline', () => {
        const pinnedPlotlines = updatedLines.filter((line) => line?.isPinned)
        const lastPinned = pinnedPlotlines.reduce((acc, current) =>
          acc.position > current.position ? acc : current
        )
        expect(fourthPinnedPlotline.position).toBe(Number(lastPinned.position) + 1)
      })
    })
  })
})
