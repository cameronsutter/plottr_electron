import { pathIsAfter } from '../withEditState'

describe('pathIsAfter', () => {
  describe('given the empty path', () => {
    describe('and the empty path', () => {
      it('should produce false', () => {
        expect(pathIsAfter([], [])).toBe(false)
      })
    })
  })
})
