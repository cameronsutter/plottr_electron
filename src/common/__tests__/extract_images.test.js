import { extractImages, imageIndex } from '../extract_images'

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
    describe('that has an array on the root level', () => {
      describe('that has an object in it', () => {
        describe('that has a root level attribute name "type" and a value "image-data"', () => {
          it('should produce a singleton list with a path to the object in the array', () => {
            expect(
              extractImages({ a: [2, { type: 'image-data', data: 'z' }], b: { c: 4 } })
            ).toEqual([{ path: ['a', 1], data: 'z' }])
          })
        })
      })
    })
    describe('that has an array on the root level', () => {
      describe('that has an object in it', () => {
        describe('that has a root level attribute name "type" and a value "image-data"', () => {
          describe('and an object on the root level', () => {
            describe('that has a root level attribute name "type" and a value "image-data"', () => {
              it('should produce a singleton list with a path to the object in the array', () => {
                expect(
                  extractImages({
                    a: [2, { type: 'image-data', data: 'aa' }],
                    b: { c: 4 },
                    c: { type: 'image-data', data: 'bb' },
                  })
                ).toEqual([
                  { path: ['a', 1], data: 'aa' },
                  { path: ['c'], data: 'bb' },
                ])
              })
            })
          })
        })
      })
    })
  })
})

describe('imageIndex', () => {
  describe('given an empty file', () => {
    it('should produce an empty object', () => {
      expect(imageIndex({})).toEqual({})
    })
  })
  describe('given a file with two images in the images key', () => {
    it('should produce an index of those images data to their ids', () => {
      expect(
        imageIndex({
          images: {
            1: {
              id: 1,
              data: 'blah',
            },
            7: {
              id: 7,
              data: 'haha',
            },
          },
        })
      ).toEqual({
        haha: 7,
        blah: 1,
      })
    })
  })
  describe('given a file with images in RCE content for a character', () => {
    describe('and no images in the index', () => {
      it('should produce a single image index with neg inf + 1 as the id', () => {
        expect(
          imageIndex({
            characters: [
              {
                id: 1,
                name: 'Link',
                description: 'Protagnist',
                notes: [
                  {
                    type: 'image-data',
                    data: 'This is some data.',
                  },
                ],
              },
            ],
          })
        ).toEqual({
          'This is some data.': Number.NEGATIVE_INFINITY + 1,
        })
      })
    })
  })
})
