import { insertBreakingVersionsPriorToBreakingVersionChange } from '../handleSpecialCases'
import {
  file_2023_01_7_fix_applies,
  file_2023_01_7_fix_does_not_apply,
  file_2023_01_7_no_migrations_collection,
} from './fixtures'
import { file_2022_5_18 } from './fixtures/index'

describe('insertBreakingVersionsPriorToBreakingVersionChange', () => {
  describe('given a file with version 2022.5.17', () => {
    it('should not add the breaking migration 2023.1.7 (that comes after it)', () => {
      const result = insertBreakingVersionsPriorToBreakingVersionChange(file_2022_5_18)
      expect(result.file.appliedMigrations).toEqual(expect.not.arrayContaining(['*m2023_1_7']))
    })
  })
  describe('given a file with the version 2023.1.7', () => {
    describe('and no applied migrations collection', () => {
      it('should add the applied migrations collection and the entry for the breaking migration', () => {
        const result = insertBreakingVersionsPriorToBreakingVersionChange(
          file_2023_01_7_no_migrations_collection
        )
        expect(result.file.appliedMigrations).toEqual(expect.arrayContaining(['*m2023_1_7']))
      })
    })
    describe('and the file has the migration in its list', () => {
      it('should leave the file alone', () => {
        expect(
          insertBreakingVersionsPriorToBreakingVersionChange(file_2023_01_7_fix_does_not_apply)
        ).toBe(file_2023_01_7_fix_does_not_apply)
      })
    })
    describe("and the file doesn't have the breaking migration in its list", () => {
      it('should add the breaking migration to the migrations list', () => {
        expect(
          insertBreakingVersionsPriorToBreakingVersionChange(file_2023_01_7_fix_applies)
        ).toEqual(file_2023_01_7_fix_does_not_apply)
      })
    })
  })
})
