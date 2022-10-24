import { migrateKnownFilesStoreObject, migrateTempFilesStoreObject } from '../stores'

describe('migrateKnownFilesStoreObject', () => {
  describe('given the empty store', () => {
    it('should produce the empty store', () => {
      const emptyStore = {}
      expect(migrateKnownFilesStoreObject(emptyStore)).toEqual(emptyStore)
    })
  })
  describe('given a store with a single entry', () => {
    describe('and that entry uses a fileURL (i.e. it does not need to be migrated)', () => {
      it('should leave the store as is', () => {
        const newSingletonStore = {
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
            fileName: 'A',
            lastOpened: 1659517191003,
          },
        }
        expect(migrateKnownFilesStoreObject(newSingletonStore)).toEqual(newSingletonStore)
      })
    })
    describe('and that entry uses a filePath id (i.e. it should be migrated)', () => {
      it('should turn that object into a fileURL indexed store entry', () => {
        const oldSingletonStore = {
          1: {
            path: '/Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
            lastOpened: 1659517191003,
          },
        }
        const newSingletonStore = {
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
            fileName: 'A',
            lastOpened: 1659517191003,
          },
        }
        expect(migrateKnownFilesStoreObject(oldSingletonStore)).toEqual(newSingletonStore)
      })
    })
  })
  describe('and a store with two entries', () => {
    describe('when both those entries are valid old entries', () => {
      it('should migrate both those entries', () => {
        const oldStore = {
          1: {
            path: '/Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
            lastOpened: 1659517191003,
          },
          2: {
            path: '/Users/johndoe/Library/Application Support/plottr/tmp/B.pltr',
            lastOpened: 1659603505904,
          },
        }
        const newStore = {
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
            fileName: 'A',
            lastOpened: 1659517191003,
          },
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/B.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/B.pltr',
            fileName: 'B',
            lastOpened: 1659603505904,
          },
        }
        expect(migrateKnownFilesStoreObject(oldStore)).toEqual(newStore)
      })
    })
    describe('when the second entry is invalid', () => {
      it('should produce a store with only the first value migrated', () => {
        const oldStore = {
          1: {
            path: '/Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
            lastOpened: 1659517191003,
          },
          2: {
            lastOpened: 1659603505904,
          },
        }
        const newStore = {
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
            fileName: 'A',
            lastOpened: 1659517191003,
          },
        }
        expect(migrateKnownFilesStoreObject(oldStore)).toEqual(newStore)
      })
    })
  })
})

describe('migrateTempFilesStoreObject', () => {
  describe('given the empty store', () => {
    it('should produce the empty store', () => {
      const emptyStore = {}
      expect(migrateTempFilesStoreObject(emptyStore)).toEqual(emptyStore)
    })
  })
  describe('given a store with a single entry', () => {
    describe('and that entry uses a fileURL (i.e. it does not need to be migrated)', () => {
      it('should leave the store as is', () => {
        const newSingletonStore = {
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
          },
        }
        expect(migrateTempFilesStoreObject(newSingletonStore)).toEqual(newSingletonStore)
      })
    })
    describe('and that entry uses a filePath id (i.e. it should be migrated)', () => {
      it('should turn that object into a fileURL indexed store entry', () => {
        const oldSingletonStore = {
          1: {
            path: '/Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
          },
        }
        const newSingletonStore = {
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
          },
        }
        expect(migrateTempFilesStoreObject(oldSingletonStore)).toEqual(newSingletonStore)
      })
    })
  })
  describe('and a store with two entries', () => {
    describe('when both those entries are valid old entries', () => {
      it('should migrate both those entries', () => {
        const oldStore = {
          1: {
            path: '/Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
          },
          2: {
            path: '/Users/johndoe/Library/Application Support/plottr/tmp/B.pltr',
          },
        }
        const newStore = {
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
          },
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/B.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/B.pltr',
          },
        }
        expect(migrateTempFilesStoreObject(oldStore)).toEqual(newStore)
      })
    })
    describe('when the second entry is invalid', () => {
      it('should produce a store with only the first value migrated', () => {
        const oldStore = {
          1: {
            path: '/Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
          },
          2: {},
        }
        const newStore = {
          'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr': {
            fileURL: 'device:///Users/johndoe/Library/Application Support/plottr/tmp/A.pltr',
          },
        }
        expect(migrateTempFilesStoreObject(oldStore)).toEqual(newStore)
      })
    })
  })
})
