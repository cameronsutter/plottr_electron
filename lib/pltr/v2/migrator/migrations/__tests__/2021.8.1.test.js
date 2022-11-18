import migration from '../2021.8.1'

jest.mock('format-message')

describe('2021.8.1', () => {
  const { state_2021_8_1_with_act, state_2021_8_1 } = require('./fixtures')
  const initial_with_act = state_2021_8_1_with_act
  const initialFile = state_2021_8_1
  describe('given a file with hierarchy on', () => {
    it('should not change it', () => {
      expect(migration(initial_with_act)).toEqual(initial_with_act)
    })
  })
  describe('given a state with hierarchy off and only 1 level', () => {
    it('should produce a hierarchy with dark and light attributes', () => {
      const migrated = migration(initialFile)
      expect(migrated.hierarchyLevels[0].name).toEqual('Chapter')
      expect(migrated.hierarchyLevels[0].light.textColor).toEqual('#0b1117')
    })
  })
})
