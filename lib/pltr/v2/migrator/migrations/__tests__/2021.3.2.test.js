import migrate from '../2021.3.2'

jest.mock('format-message')

describe('migrate', () => {
  const { emptyFile, newFileHierarchies } = require('../../../store/newFileState')
  const newFile = emptyFile()
  describe('given the new file state', () => {
    it('should produce the initial state', () => {
      expect(migrate(newFile)).toEqual(newFile)
    })
    describe('without the hierarchyLevels attribute', () => {
      const newFileWithoutHierarchies = {
        ...newFile,
        hierarchyLevels: undefined,
      }
      it('should add the default hierarchy configuration', () => {
        expect(migrate(newFileWithoutHierarchies)).toEqual({
          ...newFileWithoutHierarchies,
          hierarchyLevels: newFileHierarchies,
        })
      })
    })
  })
})
