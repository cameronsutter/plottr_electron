import { mapValues } from 'lodash'

import { newIds } from 'pltr/v2'

import { removeSystemKeys } from '../../reducers/systemReducers'
import { allBookIdsSelector, allBooksSelector } from '../../selectors/books'
import {
  bookDialogBookIdSelector,
  bookDialogBookNumberSelector,
  cardDialogBeatIdSelector,
  cardDialogCardIdSelector,
  cardDialogLineIdSelector,
  isBookDialogVisibleSelector,
  isCardDialogVisibleSelector,
} from '../../selectors/ui'
import { emptyFile } from '../../store/newFileState'
import { addBeat } from '../beats'
import { addBook, editBook } from '../books'
import { addCard, changeBeat, changeLine } from '../cards'
import { addLine } from '../lines'
import {
  loadFile,
  setBookDialogClose,
  setBookDialogOpen,
  setCardDialogClose,
  setCardDialogOpen,
} from '../ui'
import { configureStore } from './fixtures/testStore'

const EMPTY_FILE = emptyFile('Test file')
const { objectId } = newIds

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

const initialBookDialogState = {
  isOpen: false,
  bookId: null,
  bookNumber: null,
}

const exampleCard1 = {
  title: 'Card 1',
  description: 'Card 1 description',
  lineId: 1,
  beatId: 1,
}

const exampleBookAttributes = {
  title: 'Example book',
  premise: 'book description',
  genre: 'fiction',
  theme: 'test',
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

    it('should have false as initial value for isOpen', () => {
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

  describe('changeBeat', () => {
    describe('given user add a card and beats, and then opened a card', () => {
      const currentBookId = 1
      store.dispatch(addBeat(currentBookId))
      store.dispatch(addCard(exampleCard1))
      const cardId = 1
      const beatId = 1
      const lineId = 1
      store.dispatch(setCardDialogOpen(cardId, beatId, lineId))

      describe('and given changeBeat is dispatched', () => {
        const newBeatId = 2
        const previousState = store.getState().present
        const cardId = cardDialogCardIdSelector(previousState)
        store.dispatch(changeBeat(cardId, newBeatId, currentBookId))

        const presentState = store.getState().present

        it('should change the beatId of the current card equal to the newBeatId', () => {
          const changedCard = presentState.cards.find((card) => card.id == cardId)
          expect(changedCard.beatId).toEqual(newBeatId)
        })

        it('should also change the cardDialog beatId to be equal to the newBeatId', () => {
          const cardDialogState = presentState.ui.cardDialog
          expect(cardDialogState.beatId).toEqual(newBeatId)
        })
      })
    })
  })

  describe('changeLine', () => {
    describe('given user add a card and lines, and then opened a card', () => {
      const currentBookId = 1
      store.dispatch(addLine(currentBookId))
      store.dispatch(addLine(currentBookId))
      store.dispatch(addCard(exampleCard1))
      const cardId = 1
      const beatId = 1
      const lineId = 1
      store.dispatch(setCardDialogOpen(cardId, beatId, lineId))

      describe('and given changeLine is dispatched', () => {
        const newLineId = 2
        const previousState = store.getState().present
        const cardId = cardDialogCardIdSelector(previousState)
        store.dispatch(changeLine(cardId, newLineId, currentBookId))

        const presentState = store.getState().present

        it('should change the lineId of the current card equal to the newLineId', () => {
          const changedCard = presentState.cards.find((card) => card.id == cardId)
          expect(changedCard.lineId).toEqual(newLineId)
        })

        it('should also change the cardDialog lineId to be equal to the newLineId', () => {
          const cardDialogState = presentState.ui.cardDialog
          expect(cardDialogState.lineId).toEqual(newLineId)
        })
      })
    })
  })
})

describe('bookDialog', () => {
  const store = initialStore()
  const initialState = removeSystemKeys(store.getState().present)

  describe('given the initial state store', () => {
    const bookId = bookDialogBookIdSelector(initialState)
    const bookNumber = bookDialogBookNumberSelector(initialState)
    const isOpen = isBookDialogVisibleSelector(initialState)
    it('should produce initial state store', () => {
      expect(initialState.ui.bookDialog).toMatchObject(initialBookDialogState)
    })

    it('should have `null` as initial values for cardId lineId and beatId', () => {
      expect(bookId).toBeNull()
      expect(bookNumber).toBeNull()
    })

    it('should have false as initial value for isOpen', () => {
      expect(isOpen).toBeFalsy()
    })
  })

  describe('given bookDialog actions are dispatched', () => {
    describe('and setBookDialogOpen is dispatched with no bookId (addBook)', () => {
      const nextBookNumber = allBookIdsSelector(initialState).length + 1
      store.dispatch(setBookDialogOpen(null, nextBookNumber))
      const previousState = store.getState().present

      const bookDialogBookId = bookDialogBookIdSelector(previousState)
      const bookDialogBookNumber = bookDialogBookNumberSelector(previousState)
      const isOpen = isBookDialogVisibleSelector(previousState)
      const initialTotalNumberOfBooks = allBookIdsSelector(previousState).length

      it('should open the bookDialog', () => {
        expect(isOpen).toBeTruthy()
      })

      it('should not have a bookId', () => {
        expect(bookDialogBookId).toBeNull()
      })

      it('should change the bookNumber equal to the param passed', () => {
        expect(bookDialogBookNumber).toEqual(nextBookNumber)
      })

      describe('given addBook is dispatched with completely blank fields', () => {
        store.dispatch(addBook())
        const presentState = store.getState().present
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should work as before and save the book without passing any params', () => {
          expect(totalBooks).toBeGreaterThan(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, key) => {
            return value.title == '' ? true : undefined
          })
          expect(Object.keys(book).length).toBeGreaterThan(0)
        })
      })

      describe('given addBook is dispatched with id and attributes', () => {
        const allBookIds = allBookIdsSelector(previousState)
        const newBookId = objectId(allBookIds)
        store.dispatch(addBook(newBookId, { ...exampleBookAttributes }))
        const presentState = store.getState().present
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should save the book with its attributes', () => {
          expect(totalBooks).toBeGreaterThan(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, key) => {
            return value.title == exampleBookAttributes.title &&
              value.premise == exampleBookAttributes.premise &&
              value.genre == exampleBookAttributes.genre &&
              value.theme == exampleBookAttributes.theme
              ? true
              : undefined
          })
          expect(Object.keys(book).length).toBeGreaterThan(0)
        })
      })

      describe('given setBookDialogClose is dispatched', () => {
        store.dispatch(setBookDialogClose())
        const presentState = store.getState().present
        it('should be back to its initialState', () => {
          expect(presentState.ui.bookDialog).toMatchObject(initialBookDialogState)
        })
      })
    })

    describe('given setBookDialogOpen is dispatched with bookId (editBook)', () => {
      const bookId = 1
      const bookNumber = 1
      store.dispatch(setBookDialogOpen(bookId, bookNumber))
      const previousState = store.getState().present
      const currentBook = allBooksSelector(previousState)[bookId]
      const initialTotalNumberOfBooks = allBookIdsSelector(previousState).length

      const bookDialogBookId = bookDialogBookIdSelector(previousState)
      const bookDialogBookNumber = bookDialogBookNumberSelector(previousState)
      const isOpen = isBookDialogVisibleSelector(previousState)

      it('should open the bookDialog', () => {
        expect(isOpen).toBeTruthy()
      })

      it('should have a bookId', () => {
        expect(bookDialogBookId).not.toBeNull()
      })

      it('should have a bookNumber', () => {
        expect(bookDialogBookNumber).not.toBeNull()
      })

      describe('given editBook is dispatched with id and attributes', () => {
        const newTitle = 'newBook title'
        store.dispatch(editBook(currentBook.id, { ...currentBook, title: newTitle }))
        const presentState = store.getState().present
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should edit the book with the new values', () => {
          expect(totalBooks).toEqual(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, key) => {
            return value.title == newTitle &&
              value.premise == currentBook.premise &&
              value.genre == currentBook.genre &&
              value.theme == currentBook.theme
              ? true
              : undefined
          })
          expect(Object.keys(book).length).toBeGreaterThan(0)
        })
      })

      describe('given setBookDialogClose is dispatched', () => {
        store.dispatch(setBookDialogClose())
        const presentState = store.getState().present
        it('should be back to its initialState', () => {
          expect(presentState.ui.bookDialog).toMatchObject(initialBookDialogState)
        })
      })
    })
  })
})
