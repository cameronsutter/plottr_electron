import migration from '../2022.5.17'
import { state_2021_8_1, state_2022_5_18 } from './fixtures'

describe('2022.5.17', () => {
  describe('given a file with a version earlier than 2022.5.17', () => {
    it('should add the search term filters to it', () => {
      const migrated = migration(state_2021_8_1)
      expect(migrated.ui.searchTerms).toBeDefined()
      expect(migrated.ui.searchTerms.notes).toBeNull()
      expect(migrated.ui.searchTerms.characters).toBeNull()
      expect(migrated.ui.searchTerms.places).toBeNull()
      expect(migrated.ui.searchTerms.tags).toBeNull()
    })
  })
  describe('given a file with a version of at least 2022.5.18', () => {
    it('should leave the file un-touched', () => {
      expect(migration(state_2022_5_18)).toBe(state_2022_5_18)
    })
  })
})
