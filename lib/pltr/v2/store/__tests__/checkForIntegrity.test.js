import { omit } from 'lodash'

import { emptyFile } from '../newFileState'
import {
  checkForMinimalSetOfKeys,
  checkForMissingCharacterAttributes,
  checkForBrokenCharacterAttributesRelationships,
} from '../checkFileIntegrity'

const DUMMY_FILE_PATH = 'device://dummy.pltr'
const DUMMY_ACTION_TRAIL = []

describe('checkForMinimalSetOfKeys', () => {
  describe('given an empty object', () => {
    const emptyFile = {}
    it('should produce a failed promise', () => {
      expect(
        checkForMinimalSetOfKeys(DUMMY_FILE_PATH, DUMMY_ACTION_TRAIL)(emptyFile)
      ).rejects.toThrow()
    })
  })
  describe('given a new file', () => {
    const blankFile = emptyFile()
    it('should produce a successful promise with that file in it', () => {
      expect(
        checkForMinimalSetOfKeys(DUMMY_FILE_PATH, DUMMY_ACTION_TRAIL)(blankFile)
      ).resolves.toBe(blankFile)
    })
  })
  describe('given a file that lacks a key', () => {
    const missingFileKey = omit(emptyFile(), 'file')
    it('should reject the promise', () => {
      expect(
        checkForMinimalSetOfKeys(DUMMY_FILE_PATH, DUMMY_ACTION_TRAIL)(missingFileKey)
      ).rejects.toThrow()
    })
  })
})

describe('checkForMissingCharacterAttributes', () => {
  
})

describe('checkForBrokenCharacterAttributesRelationships', () => {
  
})
