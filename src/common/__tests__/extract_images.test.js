import { extractImages } from '../extract_images'

describe('extractImages', () => {
  describe('given an empty file', () => {
    it('should produce an empty list', () => {
      expect(extractImages({})).toEqual([])
    })
  })
  describe('given a synthetic file', () => {
    describe('with no object that has an attribute of name "type" and a value "image-data"', () => {
      it('should produce an empty list', () => {
        expect(extractImages({ a: 'b', c: { d: 1, e: { f: 3 } } })).toEqual([])
      })
    })
    describe('that has a root level attribute name "type" and a value "image-data"', () => {
      it('should produce a singleton list with an empty path', () => {
        expect(extractImages({ type: 'image-data', data: 'x' })).toEqual([{ path: [], data: 'x' }])
      })
    })
    describe('that has an object on the root level', () => {
      describe('that has a root level attribute name "type" and a value "image-data"', () => {
        it('should produce a singleton list with a path to the sub-object', () => {
          expect(extractImages({ a: { type: 'image-data', data: 'y' } })).toEqual([
            { path: ['a'], data: 'y' },
          ])
        })
      })
    })
  })
})
