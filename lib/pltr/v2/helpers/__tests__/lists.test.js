import { closeGap } from '../lists'

describe('closeGap', () => {
  describe('given the empty list', () => {
    const EMPTY_LIST = []
    it('should produce the empty list', () => {
      expect(closeGap(EMPTY_LIST)).toEqual(EMPTY_LIST)
    })
  })
})
