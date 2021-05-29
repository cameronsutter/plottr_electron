import migration from '../2021.6.9'

jest.mock('format-message')

describe('2021.6.9', () => {
  const { state_2021_6_9 } = require('./fixtures')
  const initialFile = state_2021_6_9
  describe('given the initial file state', () => {
    it('should produce the initial file state', () => {
      expect(migration(initialFile)).toEqual(initialFile)
    })
  })
  describe('given a state with hierarchyLevel in it', () => {
    const { hierarchyLevel } = require('../../../store/initialState')
    const stateWithHierarchy = {
      ...initialFile,
      hierarchyLevels: { 0: hierarchyLevel },
    }
    it('should produce a hierarchy with dark and light attributes', () => {
      const migrated = migration(stateWithHierarchy)
      expect(migrated.hierarchyLevels[0].dark).toEqual({
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      })
      expect(migrated.hierarchyLevels[0].light).toEqual({
        borderColor: '#6cace4',
        textColor: '#6cace4',
      })
    })
  })
})
