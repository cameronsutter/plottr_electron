import migration from '../2021.2.4'

jest.mock('format-message')

describe('2021.2.4', () => {
  const { emptyFile } = require('../../../store/newFileState')
  const newFile = emptyFile()
  const aSeriesLine = {
    id: 1,
    color: '#6cace4',
    title: 'Main Plot',
    position: 0,
    expanded: null,
  }
  const anotherSeriesLine = {
    id: 1,
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
      expect(migration(newFileWithASeriesLine).lines).toEqual(expect.arrayContaining([aSeriesLine]))
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
        expect.arrayContaining([aSeriesLine, anotherSeriesLine])
      )
    })
  })
  // Next: check that the beatids on cards now point at the new lines
})
