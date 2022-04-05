import { emptyFile } from 'pltr/v2'

import { Goldilocks, UUIDFile } from './fixtures'
import { uuidsToIntegerIds } from '../uuidsToIntegerIds'

const asNumber = (x) => {
  if (typeof x === 'number') return true
  if (typeof x !== 'string') return false

  return !isNaN(Number.parseInt(x)) && Number.parseInt(x)
}

expect.extend({
  toBeANaturalNumber(received) {
    const pass =
      (typeof received === 'string' || typeof received === 'number') && asNumber(received) >= 1
    if (pass) {
      return {
        message: () => `expected ${received} to be a natural number`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a natural number`,
        pass: false,
      }
    }
  },
  toBeANaturalNumberorNull(received) {
    const pass =
      received === null ||
      received === 'null' ||
      ((typeof received === 'string' || typeof received === 'number') && asNumber(received) >= 1)
    if (pass) {
      return {
        message: () => `expected ${received} to be a natural number or null`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a natural number or null`,
        pass: false,
      }
    }
  },
})

describe('uuidsToIntegerIds', () => {
  describe('given an empty file', () => {
    it('should produce the empty file', () => {
      expect(uuidsToIntegerIds({})).toEqual({})
    })
  })
  describe('given a new file', () => {
    it('should produce the new file', () => {
      expect(uuidsToIntegerIds(emptyFile())).toEqual(emptyFile())
    })
  })
  describe('given a valid example file', () => {
    it('should produce that file unchanged', () => {
      expect(uuidsToIntegerIds(Goldilocks)).toEqual(Goldilocks)
    })
  })
  describe('given a file with uuids instead of integer ids', () => {
    const fixed = uuidsToIntegerIds(UUIDFile)
    it('should effect some sort of change at the very least', () => {
      expect(fixed).not.toEqual(UUIDFile)
    })
    // books
    it('should ensure that all books have integer ids', () => {
      for (const bookId in fixed.books) {
        if (bookId === 'allIds') continue

        expect(bookId).toBeANaturalNumber()
        expect(fixed.books[bookId].id).toBeANaturalNumber()
      }
    })
    // beats
    it('should ensure that all beats have integer ids', () => {
      for (const beatTreeId in fixed.beats) {
        const beatTree = fixed.beats[beatTreeId]
        // children
        for (const beatId in beatTree.children) {
          expect(beatId).toBeANaturalNumberorNull()
          for (const childId of beatTree.children[beatId]) {
            expect(childId).toBeANaturalNumber()
          }
        }
        // heap
        for (const beatId in beatTree.heap) {
          expect(beatId).toBeANaturalNumber()
          expect(beatTree.heap[beatId]).toBeANaturalNumberorNull()
        }
        // index
        for (const beatId in beatTree.index) {
          expect(beatId).toBeANaturalNumber()
          expect(beatTree.index[beatId].id).toBeANaturalNumber()
          expect(beatTree.index[beatId].bookId).toBeANaturalNumber()
        }
      }
    })
    it('should associate a matching beat id for uuids that were the same before', () => {
      const uuidBeat = Object.values(UUIDFile.beats['1'].index).find(
        ({ title }) => title === 'Chapter 1'
      )
      expect(uuidBeat.id).toEqual(UUIDFile.cards[0].beatId)
      const fixedBeat = Object.values(fixed.beats['1'].index).find(
        ({ title }) => title === 'Chapter 1'
      )
      expect(fixedBeat.id).toEqual(fixed.cards[0].beatId)

      const uuidBeat2 = Object.values(UUIDFile.beats['1'].index).find(
        ({ title }) => title === 'Chapter 2'
      )
      expect(uuidBeat2.id).toEqual(UUIDFile.cards[3].beatId)
      const fixedBeat2 = Object.values(fixed.beats['1'].index).find(
        ({ title }) => title === 'Chapter 2'
      )
      expect(fixedBeat2.id).toEqual(fixed.cards[3].beatId)
    })
    // cards
    it('should ensure that all cards have integer ids', () => {
      for (const card of fixed.cards) {
        expect(card.id).toBeANaturalNumber()
      }
    })
    // categories
    it('should ensure that all categories have integer ids', () => {
      // characters
      for (const category of fixed.categories.characters) {
        expect(category.id).toBeANaturalNumber()
      }
      // places
      for (const place of fixed.categories.characters) {
        expect(place.id).toBeANaturalNumber()
      }
      // notes
      for (const note of fixed.categories.notes) {
        expect(note.id).toBeANaturalNumber()
      }
      // tags
      for (const tag of fixed.categories.tags) {
        expect(tag.id).toBeANaturalNumber()
      }
    })
    // characters
    it('should ensure that all characters have integer ids', () => {
      for (const character of fixed.characters) {
        expect(character.id).toBeANaturalNumber()
        // cards
        for (const cardId of character.cards) {
          expect(cardId).toBeANaturalNumber()
        }
        // noteIds
        for (const noteId of character.noteIds) {
          expect(noteId).toBeANaturalNumber()
        }
        // tags
        for (const tagId of character.tags) {
          expect(tagId).toBeANaturalNumber()
        }
        // categoryId
        expect(character.categoryId).toBeANaturalNumber()
        // bookIds
        for (const bookId of character.bookIds) {
          expect(bookId).toBeANaturalNumber()
        }
      }
    })
    // lines
    it('should ensure that all lines have integer ids', () => {
      for (const line of fixed.lines) {
        expect(line.id).toBeANaturalNumber()
        expect(line.bookId).toBeANaturalNumber()
        expect(line.characterId).toBeANaturalNumberorNull()
      }
    })
    // notes
    it('should ensure that all notes have integer ids', () => {
      for (const note of fixed.notes) {
        expect(note.id).toBeANaturalNumber()
        // tags
        for (const tagId of note.tags) {
          expect(tagId).toBeANaturalNumber()
        }
        // characters
        for (const characterId of note.characters) {
          expect(characterId).toBeANaturalNumber()
        }
        // places
        for (const placeId of note.places) {
          expect(placeId).toBeANaturalNumber()
        }
        // books
        for (const bookId of note.bookIds) {
          expect(bookId).toBeANaturalNumber()
        }
      }
    })
    // places
    for (const place of fixed.places) {
      expect(place.id).toBeANaturalNumber()
      // cards
      for (const cardId of place.cards) {
        expect(cardId).toBeANaturalNumber()
      }
      for (const noteId of place.noteIds) {
        expect(noteId).toBeANaturalNumber()
      }
      for (const tagId of place.tags) {
        expect(tagId).toBeANaturalNumber()
      }
      for (const bookId of place.bookIds) {
        expect(bookId).toBeANaturalNumber()
      }
    }
    // tags
    for (const tag of fixed.tags) {
      expect(tag.id).toBeANaturalNumber()
    }
  })
})
