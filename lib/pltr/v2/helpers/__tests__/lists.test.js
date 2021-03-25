import { closeGap } from '../lists'

describe('closeGap', () => {
  describe('given the empty list', () => {
    const EMPTY_LIST = []
    it('should produce the empty list', () => {
      expect(closeGap(EMPTY_LIST)).toEqual(EMPTY_LIST)
    })
  })
  describe('given a list with one "beat"', () => {
    const SINGLETON_LIST = [{ id: 0, position: 0 }]
    it('should produce that same list', () => {
      expect(closeGap(SINGLETON_LIST)).toEqual(SINGLETON_LIST)
    })
  })
  describe('given a list with two "beats" where the beats are sorted', () => {
    const TWO_ELEMENT_LIST = [
      { id: 0, position: 1 },
      { id: 1, position: 4 },
    ]
    it('should produce those beats with the correct positions', () => {
      expect(closeGap(TWO_ELEMENT_LIST)).toEqual([
        { id: 0, position: 0 },
        { id: 1, position: 1 },
      ])
    })
  })
  describe('given a list with two "beats" where the beats are not sorted', () => {
    const TWO_ELEMENT_LIST = [
      { id: 1, position: 4 },
      { id: 0, position: 1 },
    ]
    it('should produce those beats with the correct positions', () => {
      expect(closeGap(TWO_ELEMENT_LIST)).toEqual([
        { id: 0, position: 0 },
        { id: 1, position: 1 },
      ])
    })
  })
})
