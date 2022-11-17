import { makeCachedDownloadStorageImage } from '../downloadStorageImage'

describe('makeCachedDownloadStorageImage', () => {
  describe('given a dummmy downloadStorageImage', () => {
    describe('that always returns the url as the result', () => {
      describe('given the same url twice', () => {
        it('should only call the dummy function once', async () => {
          let called = 0
          const dummyDownloadStorageImage = (storageURL, fileId, userId) => {
            called++
            return Promise.resolve(storageURL)
          }
          const cachedDownloadStorageImage =
            makeCachedDownloadStorageImage(dummyDownloadStorageImage)
          const aURL = 'storage://f32gganote233b2behu/cat.png'
          const result1 = await cachedDownloadStorageImage.downloadStorageImage(
            aURL,
            'dummyid',
            'dummyid'
          )
          expect(result1).toEqual(aURL)
          const result2 = await cachedDownloadStorageImage.downloadStorageImage(
            aURL,
            'dummyid',
            'dummyid'
          )
          expect(result2).toEqual(aURL)
          expect(called).toEqual(1)
        })
      })
      describe('given the same url twice', () => {
        describe('and then a different URL', () => {
          it('should only call the dummy function twice', async () => {
            let called = 0
            const dummyDownloadStorageImage = (storageURL, fileId, userId) => {
              called++
              return Promise.resolve(storageURL)
            }
            const cachedDownloadStorageImage =
              makeCachedDownloadStorageImage(dummyDownloadStorageImage)
            const aURL = 'storage://f32gganote233b2behu/cat.png'
            const result1 = await cachedDownloadStorageImage.downloadStorageImage(
              aURL,
              'dummyid',
              'dummyid'
            )
            expect(result1).toEqual(aURL)
            const result2 = await cachedDownloadStorageImage.downloadStorageImage(
              aURL,
              'dummyid',
              'dummyid'
            )
            expect(result2).toEqual(aURL)
            const anotherURL = 'storage://f32gganote233b2behu/dog.png'
            const result3 = await cachedDownloadStorageImage.downloadStorageImage(
              anotherURL,
              'dummyid',
              'dummyid'
            )
            expect(result3).toEqual(anotherURL)
            expect(called).toEqual(2)
          })
        })
      })
    })
  })
})
