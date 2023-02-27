import { addCharacter } from '../../actions/characters'
import { addNoteWithValues, addTag } from '../../actions/notes'
import { addTag as attachTagToCharacter } from '../../actions/characters'
import { addCreatedTag } from '../../actions/tags'
import { changeCurrentView, loadFile } from '../../actions/ui'
import { emptyFile } from '../../store/newFileState'
import { charactersSortedInBookSelector } from '../charactersThirdOrder'
import { allNotesInBookSelector } from '../notesThirdOrder'
import { sortedTagsSelector } from '../tagsFirstOrder'
import { tagsFilterItemsSelector } from '../tagsThirdOrder'
import { configureStore } from './fixtures/testStore'

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

const EXAMPLE_TAGS = [
  {
    id: 1,
    title: 'new tag 1',
    color: '#3E3E3E',
  },
  {
    id: 2,
    title: 'new tag 2',
    color: '#3C3C3C',
  },
  {
    id: 3,
    title: 'new tag 3',
    color: '#3A3A3A',
  },
]

describe('tagsFilterItemsSelector', () => {
  const store = initialStore()
  const initialState = store.getState().present
  describe('given a new file', () => {
    it('should produce the empty array', () => {
      expect(tagsFilterItemsSelector(initialState)).toEqual([])
    })
  })

  describe('move to tab with tags on filter (Notes)', () => {
    store.dispatch(changeCurrentView('notes'))
    const stateAfterChangingView = store.getState().present
    describe('given the view has no contents', () => {
      it('should produce the empty array', () => {
        expect(tagsFilterItemsSelector(stateAfterChangingView)).toEqual([])
      })
    })
    describe('add notes', () => {
      store.dispatch(addNoteWithValues('note 1', 'note 1 description'))
      const stateAfterAddingNote = store.getState().present
      it('should still not have any filter items', () => {
        const currentFilterItems = tagsFilterItemsSelector(stateAfterAddingNote)
        expect(currentFilterItems.length).toBe(0)
      })
    })

    describe('add new tag', () => {
      const tag1 = EXAMPLE_TAGS[0]
      store.dispatch(addCreatedTag({ title: tag1.title, color: tag1.color }))
      const stateAfterTagisAdded = store.getState().present
      const allTags = sortedTagsSelector(stateAfterTagisAdded)

      it('should create 1 tag', () => {
        expect(allTags.length).toBe(1)
      })

      it('should have the tag matched from the tag created', () => {
        expect(allTags).toEqual(expect.arrayContaining([EXAMPLE_TAGS[0]]))
      })

      it('should still not have any filter items', () => {
        const currentFilterItems = tagsFilterItemsSelector(stateAfterTagisAdded)
        expect(currentFilterItems.length).toBe(0)
      })

      describe('edit note by adding the tag created', () => {
        const allNotes = allNotesInBookSelector(store.getState().present)
        const firstNote = allNotes[0]
        const firstTag = allTags[0]
        store.dispatch(addTag(firstNote.id, firstTag.id))
        const newFilterItems = tagsFilterItemsSelector(store.getState().present)

        it('should have 1 tag from the Tags filter list', () => {
          expect(newFilterItems.length).toBe(1)
        })

        it('should have the tag from the tag attached to the note', () => {
          expect(newFilterItems).toEqual(expect.arrayContaining([EXAMPLE_TAGS[0]]))
        })
      })
    })
  })

  describe('move to tab with tags on filter (Notes)', () => {
    store.dispatch(changeCurrentView('characters'))
    const stateAfterChangingView = store.getState().present
    describe('given the view has no contents', () => {
      it('should produce the empty array', () => {
        expect(tagsFilterItemsSelector(stateAfterChangingView)).toEqual([])
      })
    })
    describe('add character', () => {
      store.dispatch(addCharacter('character 1'))
      const stateAfterAddingNote = store.getState().present
      it('should still not have any filter items', () => {
        const currentFilterItems = tagsFilterItemsSelector(stateAfterAddingNote)
        expect(currentFilterItems.length).toBe(0)
      })
    })

    describe('add new tag', () => {
      const tag2 = EXAMPLE_TAGS[1]
      store.dispatch(addCreatedTag({ title: tag2.title, color: tag2.color }))
      const stateAfterTagisAdded = store.getState().present
      const allTags = sortedTagsSelector(stateAfterTagisAdded)

      it('should have 2 tags now', () => {
        expect(allTags.length).toBe(2)
      })

      it('should have the tag matched from the tag created', () => {
        expect(allTags).toEqual(expect.arrayContaining([EXAMPLE_TAGS[1]]))
      })

      it('should still not have any filter items', () => {
        const currentFilterItems = tagsFilterItemsSelector(stateAfterTagisAdded)
        expect(currentFilterItems.length).toBe(0)
      })

      describe('attach tag to the character with the tag created', () => {
        const allCharacters = charactersSortedInBookSelector(store.getState().present)
        const firstCharacter = allCharacters[0]
        const secondTagTag = allTags[1]
        store.dispatch(attachTagToCharacter(firstCharacter.id, secondTagTag.id))
        const newFilterItems = tagsFilterItemsSelector(store.getState().present)

        it('should have 1 tag from the Tags filter list', () => {
          expect(newFilterItems.length).toBe(1)
        })

        it('should have the tag from the tag attached to the character', () => {
          expect(newFilterItems).toEqual(expect.arrayContaining([EXAMPLE_TAGS[1]]))
        })
      })
    })
  })
})
