import migration from '../2021.2.4'

jest.mock('format-message')

describe('2021.2.4', () => {
  const { emptyFile } = require('../../../store/newFileState')
  const { card } = require('../../../store/initialState')
  const newFile = emptyFile()
  const aSeriesLine = {
    id: 1,
    color: '#6cace4',
    title: 'Main Plot',
    position: 0,
    expanded: null,
  }
  const aMigratedSeriesLine = {
    id: 3,
    bookId: 'series',
    fromTemplateId: null,
    characterId: null,
    color: '#6cace4',
    title: 'Main Plot',
    position: 0,
    expanded: null,
  }
  const anotherSeriesLine = {
    id: 2,
    color: '#6cace4',
    title: 'Main Plot',
    position: 0,
    expanded: null,
  }
  const anotherMigratedSeriesLine = {
    id: 4,
    bookId: 'series',
    fromTemplateId: null,
    characterId: null,
    color: '#6cace4',
    title: 'Main Plot',
    position: 0,
    expanded: null,
  }
  const newFileWithASeriesLine = {
    ...newFile,
    seriesLines: [aSeriesLine],
  }
  const newFileWithTwoSeriesLines = {
    ...newFileWithASeriesLine,
    seriesLines: [...newFileWithASeriesLine.seriesLines, anotherSeriesLine],
  }
  const aChapterCard = {
    ...card,
    lineId: 1,
  }
  const anotherChapterCard = {
    ...card,
    lineId: 1,
    id: 2,
  }
  const aBeatCard = {
    ...card,
    seriesLineId: 1,
    id: 3,
  }
  const anotherBeatCard = {
    ...card,
    seriesLineId: 2,
    id: 4,
  }
  const aMigratedBeatCard = {
    ...card,
    lineId: 3,
    id: 3,
  }
  const anotherMigratedBeatCard = {
    ...card,
    lineId: 4,
    id: 4,
  }
  const newFileWithSomeCards = {
    ...newFileWithTwoSeriesLines,
    cards: [aChapterCard, anotherChapterCard, aBeatCard, anotherBeatCard],
  }
  describe('given an empty file state', () => {
    it('should produce the current initial state when given the current initial state', () => {
      expect(migration(newFile)).toEqual(newFile)
    })
  })
  describe('given a state with a single series line', () => {
    it('should effect some change', () => {
      expect(migration(newFileWithASeriesLine)).not.toEqual(newFileWithASeriesLine)
    })
    it('should produce a state with no seriesLines', () => {
      expect(migration(newFileWithASeriesLine).seriesLines).not.toBeDefined()
    })
    it('should produce a state which still contains the original lines', () => {
      expect(migration(newFileWithASeriesLine).lines).toEqual(
        expect.arrayContaining(newFileWithASeriesLine.lines)
      )
    })
    it('should produce a state with the series line present in lines', () => {
      expect(migration(newFileWithASeriesLine).lines).toEqual(
        expect.arrayContaining([aMigratedSeriesLine])
      )
    })
  })
  describe('given a state with two series lines', () => {
    it('should effect some change', () => {
      expect(migration(newFileWithTwoSeriesLines)).not.toEqual(newFileWithTwoSeriesLines)
    })
    it('should produce a state with no seriesLines', () => {
      expect(migration(newFileWithTwoSeriesLines).seriesLines).not.toBeDefined()
    })
    it('should produce a state which still contains the original lines', () => {
      expect(migration(newFileWithTwoSeriesLines).lines).toEqual(
        expect.arrayContaining(newFileWithTwoSeriesLines.lines)
      )
    })
    it('should produce a state with the series line present in lines', () => {
      expect(migration(newFileWithTwoSeriesLines).lines).toEqual(
        expect.arrayContaining([aMigratedSeriesLine, anotherMigratedSeriesLine])
      )
    })
  })
  describe('given a state with cards', () => {
    it('should leave the cards associated with a book alone', () => {
      expect(migration(newFileWithSomeCards).cards).toEqual(
        expect.arrayContaining([aChapterCard, anotherChapterCard])
      )
    })
    it('should change the cards which are associated with a series line to point at the new id', () => {
      expect(migration(newFileWithSomeCards).cards).toEqual(
        expect.arrayContaining([aMigratedBeatCard, anotherMigratedBeatCard])
      )
    })
  })
})
