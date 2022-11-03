import { removeSystemKeys } from '../../reducers/systemReducers'
import {
  cardDialogBeatIdSelector,
  cardDialogCardIdSelector,
  cardDialogLineIdSelector,
  isCardDialogVisibleSelector,
} from '../../selectors/ui'
import { emptyFile } from '../../store/newFileState'
import { loadFile, setCardDialogClose, setCardDialogOpen } from '../ui'
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

const initialCardDialogState = {
  isOpen: false,
  cardId: null,
  lineId: null,
  beatId: null,
}

describe('cardDialog', () => {
  const store = initialStore()
  const initialState = removeSystemKeys(store.getState().present)
  describe('given the initial state store', () => {
    const cardId = cardDialogCardIdSelector(initialState)
    const beatId = cardDialogBeatIdSelector(initialState)
    const lineId = cardDialogLineIdSelector(initialState)
    const isOpen = isCardDialogVisibleSelector(initialState)
    it('should produce initial state store', () => {
      expect(initialState.ui.cardDialog).toMatchObject(initialCardDialogState)
    })

    it('should have `null` as initial values for cardId lineId and beatId', () => {
      expect(cardId).toBeNull()
      expect(beatId).toBeNull()
      expect(lineId).toBeNull()
    })

    it('should have false as initial valuefor isOpen', () => {
      expect(isOpen).toBeFalsy()
    })
  })

  describe('given cardDialog actions are dispatched', () => {
    describe('given setCardDialogOpen is dispatched', () => {
      store.dispatch(setCardDialogOpen(1, 1, 1))
      const presentState = store.getState().present

      const cardId = cardDialogCardIdSelector(presentState)
      const beatId = cardDialogBeatIdSelector(presentState)
      const lineId = cardDialogLineIdSelector(presentState)
      const isOpen = isCardDialogVisibleSelector(presentState)

      it('should have no null values', () => {
        expect(cardId).not.toBeNull()
        expect(lineId).not.toBeNull()
        expect(beatId).not.toBeNull()
      })

      it('should have "1" as a value for cardId, lineId and beatId', () => {
        expect(cardId).toBe(1)
        expect(lineId).toBe(1)
        expect(beatId).toBe(1)
      })

      it('should be true for isOpen prop', () => {
        expect(isOpen).toBeTruthy()
      })
    })

    describe('given no another cardDialog action is dispatched', () => {
      const presentState = store.getState().present

      const cardId = cardDialogCardIdSelector(presentState)
      const beatId = cardDialogBeatIdSelector(presentState)
      const lineId = cardDialogLineIdSelector(presentState)
      const isOpen = isCardDialogVisibleSelector(presentState)

      it('should not change the values for cardId, lineId, beatId and isOpen', () => {
        expect(cardId).toBe(1)
        expect(lineId).toBe(1)
        expect(beatId).toBe(1)
        expect(isOpen).toBeTruthy()
      })
    })

    describe('given setCardDialogClose is dispatched', () => {
      store.dispatch(setCardDialogClose())
      const presentState = store.getState().present

      const cardId = cardDialogCardIdSelector(presentState)
      const beatId = cardDialogBeatIdSelector(presentState)
      const lineId = cardDialogLineIdSelector(presentState)
      const isOpen = isCardDialogVisibleSelector(presentState)

      it('should have null values for cardId, lineId, beatId', () => {
        expect(cardId).toBeNull()
        expect(lineId).toBeNull()
        expect(beatId).toBeNull()
      })

      it('should be false for isOpen prop', () => {
        expect(isOpen).toBeFalsy()
      })

      it('should match the object from the initial state store', () => {
        expect(presentState.ui.cardDialog).toMatchObject(initialCardDialogState)
      })
    })
  })
})
