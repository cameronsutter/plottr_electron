const KEYS_OF_INTEREST = [
  'books',
  'beats',
  'cards',
  'characters',
  'lines',
  'notes',
  'places',
  'tags',
]

const isNumber = (x) => {
  return typeof x === 'number'
}

export const uuidsToIntegerIds = (jsonFile) => {
  const uuidIndex = {
    bookIds: {},
    beatIds: {},
    cardIds: {},
    characterIds: {},
    tagIds: {},
  }

  const integerId = (x, type) => {
    if (isNumber(x)) return x
    if (uuidIndex[type][x]) return uuidIndex[type][x]

    const newId = Object.keys(uuidIndex[type]).length + 1
    uuidIndex[type][x] = newId
    return newId
  }

  const integerIdOrNull = (x, type) => {
    if (x === null) return null

    return integerId(x, type)
  }

  const fixKey = (key, originalFile, destinationFile) => {
    switch (key) {
      case 'books': {
        return {
          ...destinationFile,
          books: Object.keys(originalFile.books).reduce((acc, nextBookId) => {
            if (nextBookId === 'allIds') return acc

            const id = integerId(nextBookId, 'bookIds')
            return {
              ...acc,
              [id]: {
                ...originalFile.books[nextBookId],
                id: id,
              },
            }
          }),
        }
      }
      case 'beats': {
        return {
          ...destinationFile,
          beats: Object.keys(originalFile.beats).reduce((acc, nextBookId) => {
            return {
              ...acc,
              [nextBookId]: {
                children: Object.keys(originalFile.beats[nextBookId].children).reduce(
                  (childrenAcc, nextChildId) => {
                    return {
                      ...childrenAcc,
                      [integerIdOrNull(nextChildId, 'beatIds')]: originalFile.beats[
                        nextBookId
                      ].children[nextChildId].map((childId) => integerId(childId, 'beatIds')),
                    }
                  }
                ),
                heap: Object.keys(originalFile.beats[nextBookId].heap).reduce(
                  (heapAcc, nextChildId) => {
                    return {
                      ...heapAcc,
                      [integerId(nextChildId, 'beatIds')]: integerIdOrNull(
                        originalFile.beats[nextBookId].heap[nextChildId],
                        'beatIds'
                      ),
                    }
                  }
                ),
                index: Object.keys(originalFile.beats[nextBookId].index).reduce(
                  (indexAcc, nextBeatId) => {
                    return {
                      ...indexAcc,
                      [integerId(nextBeatId, 'beatIds')]: {
                        ...originalFile.beats.index[nextBeatId],
                        id: integerId(nextBeatId, 'beatIds'),
                      },
                    }
                  }
                ),
              },
            }
          }),
        }
      }
      case 'cards': {
        return {
          ...destinationFile,
          cards: originalFile.cards.map((card) => {
            return {
              ...card,
              id: integerId(card.id, 'cardIds'),
              lineId: integerId(card.lineId, 'lineIds'),
              beatId: integerId(card.beatId, 'beatIds'),
              tags: card.tags.map((tagId) => integerId(tagId, 'tagIds')),
              characters: card.characters.map((characterId) =>
                integerId(characterId, 'characterIds')
              ),
              places: card.places.map((placeId) => integerId(placeId, 'placeIds')),
            }
          }),
        }
      }
      case 'characters': {
        return {
          ...destinationFile,
          characters: originalFile.characters.map((character) => {
            return {
              ...character,
              id: integerId(character.id, 'characterIds'),
              cards: character.cards.map((cardId) => integerId(cardId, 'cardIds')),
              noteIds: character.noteIds.map((noteId) => integerId(noteId, 'noteIds')),
              tags: character.tags.map((tagId) => integerId(tagId, 'tagIds')),
              bookIds: character.bookIds.map((bookId) => integerId(bookId, 'bookIds')),
            }
          }),
        }
      }
      case 'lines': {
        return {
          ...destinationFile,
          lines: originalFile.lines.map((line) => {
            return {
              ...line,
              id: integerId(line.id, 'lineIds'),
              bookId: integerId(line.bookId, 'bookIds'),
              characterId: integerIdOrNull(line.characterId, 'characterIds'),
            }
          }),
        }
      }
      case 'notes': {
        return {
          ...destinationFile,
          notes: originalFile.notes.map((note) => {
            return {
              ...note,
              id: integerId(note.id, 'noteIds'),
              tags: note.tags.map((tagId) => integerId(tagId, 'tagIds')),
              characters: note.characters.map((characterId) =>
                integerId(characterId, 'characterIds')
              ),
              places: note.places.map((placeId) => integerId(placeId, 'placeIds')),
              bookIds: note.bookIds.map((bookId) => integerId(bookId, 'bookIds')),
            }
          }),
        }
      }
      case 'places': {
        return {
          ...destinationFile,
          places: originalFile.places.map((place) => {
            return {
              ...place,
              id: integerId(place.id, 'placeIds'),
              cards: place.cards.map((cardId) => integerId(cardId, 'cardIds')),
              noteIds: place.noteIds.map((noteId) => integerId(noteId, 'noteIds')),
              tags: place.tags.map((tagId) => integerId(tagId, 'tagIds')),
              bookIds: place.tags.map((bookId) => integerId(bookId, 'bookIds')),
            }
          }),
        }
      }
      case 'tags': {
        
      }
      default:
        return destinationFile
    }
  }

  return Object.keys(jsonFile).reduce((acc, key) => {
    if (KEYS_OF_INTEREST.indexOf(key) !== -1) {
      return {
        ...acc,
        [key]: jsonFile[key],
      }
    } else {
      return fixKey(key, jsonFile, acc)
    }
  }, {})
}
