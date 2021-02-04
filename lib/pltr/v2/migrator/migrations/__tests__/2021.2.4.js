import migration from '../2021.2.4'

jest.mock('format-message')

describe('2021.2.4', () => {
  const { emptyFile } = require('../../../store/newFileState')
  const newFile = emptyFile()
  const newFileWithASeriesLine = {
    ...newFile,
    seriesLines: [
      {
        id: 1,
        color: '#6cace4',
        title: 'Main Plot',
        position: 0,
        expanded: null,
      },
    ],
  }
  it('should produce the current initial state when given the current initial state', () => {
    expect(migration(newFile)).toEqual(newFile)
  })
  it('should change a file state which has series lines in it', () => {
    expect(migration(newFileWithASeriesLine)).not.toEqual(newFileWithASeriesLine)
  })
})
