import { removeSystemKeys } from '../../reducers/systemReducers'
import {
  cardDialogBeatIdSelector,
  cardDialogCardIdSelector,
  cardDialogLineIdSelector,
  isCardDialogVisibleSelector,
} from '../../selectors/ui'
import { emptyFile } from '../../store/newFileState'
import { addCard } from '../cards'
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

const exampleCard1 = {
  title: 'Card 1',
  description: 'Card 1 description',
  lineId: 1,
  beatId: 1,
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
    describe('and setCardDialogOpen is dispatched', () => {
      const cardId = 1
      const beatId = 1
      const lineId = 1
      store.dispatch(setCardDialogOpen(cardId, beatId, lineId))
      const presentState = store.getState().present

      const cardDialogCardId = cardDialogCardIdSelector(presentState)
      const cardDialogBeatId = cardDialogBeatIdSelector(presentState)
      const cardDialogLineId = cardDialogLineIdSelector(presentState)
      const isOpen = isCardDialogVisibleSelector(presentState)

      it('should not allow to open non existing card', () => {
        expect(isOpen).toBeFalsy()
      })

      it('should not change the cardDialog state', () => {
        expect(cardDialogCardId).toBeNull()
        expect(cardDialogBeatId).toBeNull()
        expect(cardDialogLineId).toBeNull()
      })

      describe('given user create new card', () => {
        describe('and cardId exist from the `cards` on present state', () => {
          store.dispatch(addCard(exampleCard1))
          const cardId = 1
          const beatId = 1
          const lineId = 1
          store.dispatch(setCardDialogOpen(cardId, beatId, lineId))
          const presentState = store.getState().present

          const cardDialogCardId = cardDialogCardIdSelector(presentState)
          const cardDialogBeatId = cardDialogBeatIdSelector(presentState)
          const cardDialogLineId = cardDialogLineIdSelector(presentState)
          const isOpen = isCardDialogVisibleSelector(presentState)

          it('should have no null values for cardDialog state', () => {
            expect(cardDialogCardId).not.toBeNull()
            expect(cardDialogLineId).not.toBeNull()
            expect(cardDialogBeatId).not.toBeNull()
          })
          it('should have "1" as a value for cardId, lineId and beatId', () => {
            expect(cardDialogCardId).toEqual(cardId)
            expect(cardDialogBeatId).toBe(beatId)
            expect(cardDialogLineId).toBe(lineId)
          })

          it('should open the matched CardDialog id', () => {
            expect(isOpen).toBeTruthy()
          })
        })
      })
    })

    describe('given no another cardDialog action is dispatched', () => {
      const presentState = store.getState().present

      const cardId = cardDialogCardIdSelector(presentState)
      const beatId = cardDialogBeatIdSelector(presentState)
      const lineId = cardDialogLineIdSelector(presentState)
      const isOpen = isCardDialogVisibleSelector(presentState)

      it('should not change the values for cardId, lineId, beatId and isOpen', () => {
        expect(cardId).toEqual(1)
        expect(lineId).toEqual(1)
        expect(beatId).toEqual(1)
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
