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
import { loadFile, setCharacterFilter } from '../../actions/ui'
import { deleteCharacterAttribute, editCharacterAttributeMetadata } from '../../actions/attributes'
import { addCharacter as addCharacterToCard } from '../../actions/cards'
import { addCharacter, editCharacterAttributeValue } from '../../actions/characters'
import { setAppSettings } from '../../actions/settings'
import { setPermission } from '../../actions/permission'
import { permissionSelector } from '../../selectors/permission'
import { changeCurrentTimeline } from '../../actions/ui'
import { addBook } from '../../actions/books'
import { currentTimelineSelector } from '../../selectors/ui'
import { setUserId } from '../../actions/client'

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
