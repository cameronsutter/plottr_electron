import { extractImages, imageIndex, patchImages } from '../extract_images'

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
      expect(imageIndex([], {})).toEqual({})
    })
  })
  describe('given a file with two images in the images key', () => {
    it('should produce an index of those images data to their ids', () => {
      const file = {
        images: {
          1: {
            id: 1,
            data: 'blah',
            path: '',
          },
          7: {
            id: 7,
            data: 'haha',
            path: '',
          },
        },
      }
      expect(imageIndex(extractImages(file), file)).toEqual({
        haha: 7,
        blah: 1,
      })
    })
  })
  describe('given a file with images in RCE content for a character', () => {
    describe('and no images in the index', () => {
      it('should produce a single image index with neg inf + 1 as the id', () => {
        const file = {
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
        }
        expect(imageIndex(extractImages(file), file)).toEqual({
          'This is some data.': Number.NEGATIVE_INFINITY + 1,
        })
      })
    })
    describe('and images in the image index', () => {
      it('should produce an index with both the images from the content and the images in the index', () => {
        const file = {
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
          images: {
            1: {
              id: 1,
              data: 'blah',
              path: '',
            },
            7: {
              id: 7,
              data: 'haha',
              path: '',
            },
          },
        }
        expect(imageIndex(extractImages(file), file)).toEqual({
          blah: 1,
          haha: 7,
          'This is some data.': 8,
        })
      })
      describe('when there are duplicate images by their content', () => {
        it('not produce duplicate images', () => {
          const file = {
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
            images: {
              1: {
                id: 1,
                data: 'blah',
                path: '',
              },
              7: {
                id: 7,
                data: 'haha',
                path: '',
              },
              9: {
                id: 9,
                data: 'This is some data.',
                path: '',
              },
            },
          }
          expect(imageIndex(extractImages(file), file)).toEqual({
            blah: 1,
            haha: 7,
            'This is some data.': 9,
          })
        })
      })
    })
  })
})

describe('patchImages', () => {
  describe('given the empty file', () => {
    it('should produce the empty file with an empty image index', () => {
      expect(patchImages([], {}, {}, {})).toEqual({ images: {} })
    })
  })
  describe('given a file with images only present in the image index', () => {
    describe('and a urlIndex that does not cover those images', () => {
      it('should throw an exception', () => {
        const file = {
          images: {
            1: {
              id: 1,
              data: 'blah',
              path: 'test',
              name: 'blah',
            },
            7: {
              id: 7,
              data: 'haha',
              path: 'test2',
              name: 'haha',
            },
            9: {
              id: 9,
              data: 'This is some data.',
              path: 'test3',
              name: 'This is some data.',
            },
          },
        }
        const extractedImages = extractImages(file)
        expect(() =>
          patchImages(
            imageIndex(extractedImages, file),
            extractedImages,
            {
              2: 'storage://images/tetttot/blah.jpg',
              4: 'storage://images/tetttot/hehe.jpg',
            },
            file
          )
        ).toThrow()
      })
    })
    describe('and a urlIndex that covers those images', () => {
      it('should produce a new file with updated images', () => {
        const file = {
          images: {
            1: {
              id: 1,
              data: 'blah',
              path: 'test',
              name: 'blah',
            },
            7: {
              id: 7,
              data: 'haha',
              path: 'test2',
              name: 'haha',
            },
            9: {
              id: 9,
              data: 'This is some data.',
              path: 'test3',
              name: 'This is some data.',
            },
          },
        }
        const extractedImages = extractImages(file)
        expect(
          patchImages(
            extractedImages,
            imageIndex(extractedImages, file),
            {
              1: 'storage://images/tetttot/blah.jpg',
              7: 'storage://images/tetttot/hehe.jpg',
              9: 'storage://images/tetttot/erm.jpg',
            },
            file
          )
        ).toEqual({
          images: {
            1: {
              id: 1,
              data: '',
              path: 'storage://images/tetttot/blah.jpg',
              name: 'blah',
            },
            7: {
              id: 7,
              data: '',
              path: 'storage://images/tetttot/hehe.jpg',
              name: 'haha',
            },
            9: {
              id: 9,
              data: '',
              path: 'storage://images/tetttot/erm.jpg',
              name: 'This is some data.',
            },
          },
        })
      })
    })
  })
  describe('given a file with only images present in RCE content', () => {
    it('should replace content in those images', () => {
      const file = {
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
      }
      const extractedImages = extractImages(file)
      expect(
        patchImages(
          extractedImages,
          imageIndex(extractedImages, file),
          {
            [Number.NEGATIVE_INFINITY + 1]: 'storage://images/tetttot/blah.jpg',
          },
          file
        )
      ).toEqual({
        characters: [
          {
            id: 1,
            name: 'Link',
            description: 'Protagnist',
            notes: [
              {
                type: 'image-link',
                storageUrl: 'storage://images/tetttot/blah.jpg',
              },
            ],
          },
        ],
        images: {
          [Number.NEGATIVE_INFINITY + 1]: {
            id: Number.NEGATIVE_INFINITY + 1,
            name: '',
            data: '',
            path: 'storage://images/tetttot/blah.jpg',
          },
        },
      })
    })
  })
})
