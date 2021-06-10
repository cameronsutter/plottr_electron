import { greaterBySemver } from '../greaterBySemver'

describe('greaterBySemver', () => {
  describe('given two empty versions', () => {
    it('should throw an exception because *a* version is invalid', () => {
      expect(() => {
        greaterBySemver('', '')
      }).toThrow()
    })
  })
  describe('given m2021_2_3', () => {
    describe('and m2021_3_3', () => {
      it('should produce false', () => {
        expect(greaterBySemver('m2021_2_3', 'm2021_3_3')).toEqual(false)
      })
    })
    describe('and m2021_2_3', () => {
      it('should produce false', () => {
        expect(greaterBySemver('m2021_2_3', 'm2021_2_3')).toEqual(false)
      })
    })
    describe('and m2021_1_20', () => {
      it('should produce true', () => {
        expect(greaterBySemver('m2021_2_3', 'm2021_1_20')).toEqual(true)
      })
    })
  })
})
