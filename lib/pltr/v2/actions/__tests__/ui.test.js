import { mapValues } from 'lodash'

import { removeSystemKeys } from '../../reducers/systemReducers'
import { allBookIdsSelector, allBooksSelector } from '../../selectors/books'
import {
  bookDialogBookIdSelector,
  bookNumberSelector,
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
  openNewBookDialog,
  openEditBookDialog,
  setCardDialogClose,
  setCardDialogOpen,
  closeBookDialog,
} from '../ui'
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

const initialBookDialogState = {
  isOpen: false,
  bookId: null,
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

function isAnObject(val) {
  if (val && val instanceof Object && !Array.isArray(val)) {
    return true
  } else {
    return false
  }
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
    const isOpen = isBookDialogVisibleSelector(initialState)
    it('should produce initial state store', () => {
      expect(initialState.ui.bookDialog).toMatchObject(initialBookDialogState)
    })

    it('should have `null` as initial values for cardId lineId and beatId', () => {
      expect(bookId).toBeNull()
    })

    it('should have false as initial value for isOpen', () => {
      expect(isOpen).toBeFalsy()
    })
  })

  describe('given bookDialog actions are dispatched', () => {
    describe('and openNewBookDialog is dispatched', () => {
      const nextBookNumber = allBookIdsSelector(initialState).length + 1
      store.dispatch(openNewBookDialog())
      const previousState = store.getState().present
      const bookDialogBookId = bookDialogBookIdSelector(previousState)
      const bookNumber = bookNumberSelector(previousState)
      const isOpen = isBookDialogVisibleSelector(previousState)
      const initialTotalNumberOfBooks = allBookIdsSelector(previousState).length

      it('should open the bookDialog', () => {
        expect(isOpen).toBeTruthy()
      })

      it('should not have a bookId', () => {
        expect(bookDialogBookId).toBeNull()
      })

      it('should change the bookNumber equal to the param passed', () => {
        expect(bookNumber).toEqual(nextBookNumber)
      })

      describe('given addBook is dispatched with completely blank fields', () => {
        store.dispatch(addBook())
        const presentState = store.getState().present
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should work as before and save the book without passing any params', () => {
          expect(totalBooks).toBeGreaterThan(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, key, obj) => {
            if (isAnObject(value) && !value.title) {
              return value
            }
            return undefined
          })
          const filteredBook = Object.values(book).filter(Boolean)
          expect(filteredBook[0].title).toBeUndefined()
          expect(filteredBook[0].theme).toBeUndefined()
          expect(filteredBook[0].title).toBeUndefined()
          expect(filteredBook[0].title).toBeUndefined()
        })
      })

      describe('given addBook is dispatched with id and attributes', () => {
        store.dispatch(
          addBook(
            exampleBookAttributes.title,
            exampleBookAttributes.premise,
            exampleBookAttributes.genre,
            exampleBookAttributes.theme
          )
        )
        const presentState = store.getState().present
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should save the book with its attributes', () => {
          expect(totalBooks).toBeGreaterThan(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, key) => {
            if (typeof value == 'object' && value.title == exampleBookAttributes.title) {
              return value
            }
            return undefined
          })
          const filteredBook = Object.values(book).filter((val) => {
            return val
          })

          expect(filteredBook[0].title).toEqual(exampleBookAttributes.title)
          expect(filteredBook[0].theme).toEqual(exampleBookAttributes.theme)
          expect(filteredBook[0].genre).toEqual(exampleBookAttributes.genre)
          expect(filteredBook[0].premise).toEqual(exampleBookAttributes.premise)
        })
      })

      describe('given closeBookDialog is dispatched', () => {
        store.dispatch(closeBookDialog())
        const presentState = store.getState().present
        it('should be back to its initialState', () => {
          expect(presentState.ui.bookDialog).toMatchObject(initialBookDialogState)
        })
      })
    })

    describe('given openEditBookDialog is dispatched', () => {
      const bookId = 1
      store.dispatch(openEditBookDialog(bookId))
      const previousState = store.getState().present
      const currentBook = allBooksSelector(previousState)[bookId]
      const initialTotalNumberOfBooks = allBookIdsSelector(previousState).length
      const bookDialogBookId = bookDialogBookIdSelector(previousState)
      const bookNumber = bookNumberSelector(previousState)
      const isOpen = isBookDialogVisibleSelector(previousState)

      it('should open the bookDialog', () => {
        expect(isOpen).toBeTruthy()
      })

      it('should have a bookId', () => {
        expect(bookDialogBookId).not.toBeNull()
      })

      it('should have a bookNumber', () => {
        expect(bookNumber).not.toBeNull()
      })

      describe('given editBook is dispatched with id and attributes', () => {
        const newTitle = 'newBook title'
        store.dispatch(
          editBook(
            currentBook.id,
            newTitle,
            exampleBookAttributes.premise,
            exampleBookAttributes.genre,
            exampleBookAttributes.theme
          )
        )
        const presentState = store.getState().present
        const allBooks = allBooksSelector(presentState)
        const totalBooks = allBookIdsSelector(presentState).length

        it('should edit the book with the new values', () => {
          expect(totalBooks).toEqual(initialTotalNumberOfBooks)

          const book = mapValues(allBooks, (value, key) => {
            if (typeof value == 'object' && value.title == newTitle) {
              return value
            }
            return undefined
          })
          const filteredBook = Object.values(book).filter((val) => {
            return val
          })

          expect(filteredBook[0].title).toEqual(newTitle)
          expect(filteredBook[0].theme).toEqual(exampleBookAttributes.theme)
          expect(filteredBook[0].genre).toEqual(exampleBookAttributes.genre)
          expect(filteredBook[0].premise).toEqual(exampleBookAttributes.premise)
        })
      })

      describe('given closeBookDialog is dispatched', () => {
        store.dispatch(closeBookDialog())
        const presentState = store.getState().present
        it('should be back to its initialState', () => {
          expect(presentState.ui.bookDialog).toMatchObject(initialBookDialogState)
        })
      })
    })
  })
})
