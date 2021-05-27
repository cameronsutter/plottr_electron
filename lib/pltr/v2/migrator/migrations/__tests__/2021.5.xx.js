import migration from '../2021.5.xx'

jest.mock('format-message')

describe('2021.5.xx', () => {
  const { state_2021_5_xx } = require('./fixtures')
  const initialFile = state_2021_5_xx
  describe('given the initial file state', () => {
    it('should produce the initial file state', () => {
      expect(migration(initialFile)).toEqual(initialFile)
    })
  })
  describe('given a state with hierarchyLevel in it', () => {
    const { hierarchyLevel } = require('../../../store/initialState')
    const stateWithHierarchy = {
      ...initialFile,
      hierarchyLevels: { hierarchyLevel },
    }
    it('should effect a change of any nature', () => {
      expect(migration(stateWithHierarchy)).not.toEqual(stateWithHierarchy)
    })
    it('should produce a hierarchy with dark and light attributes', () => {
      const migrated = migration(stateWithHierarchy)
      expect(migrated.hierarchyLevel.dark).toEqual({ borderColor: '#c9e6ff', textColor: '#c9e6ff' })
      expect(migrated.hierarchyLevel.light).toEqual({
        borderColor: '#6cace4',
        textColor: '#6cace4',
      })
    })
  })
})
