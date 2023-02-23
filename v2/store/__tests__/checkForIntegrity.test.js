import { omit } from 'lodash'

import { emptyFile } from '../newFileState'
import {
  checkForMinimalSetOfKeys,
  checkForMissingCharacterAttributes,
  checkForBrokenCharacterAttributesRelationships,
} from '../checkFileIntegrity'

import {
  no_problematic_attributes,
  attribute_metadata_missing_id,
  attribute_metadata_missing_name,
  attribute_metadata_missing_type,
  missing_character_attribute_metadata,
  attribute_values_reference_non_existant_books,
  duplicated_attribute_values,
} from './fixtures'
import { missing_metadata_entry_for_character_attribute } from './fixtures/index'

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
  describe('given a file with no problems', () => {
    it('should produce the given file unchanged', () => {
      expect(
        checkForMissingCharacterAttributes(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(no_problematic_attributes)
      ).resolves.toBe(no_problematic_attributes)
    })
  })
  describe('given a file with character attributes whose ids do not appear in metadata', () => {
    it('should produce a rejected promise', () => {
      expect(
        checkForMissingCharacterAttributes(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(missing_metadata_entry_for_character_attribute)
      ).rejects.toThrow()
    })
  })
})

describe('checkForBrokenCharacterAttributesRelationships', () => {
  describe('given a file with no problems', () => {
    it('should produce the given file unchanged', () => {
      expect(
        checkForBrokenCharacterAttributesRelationships(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(no_problematic_attributes)
      ).resolves.toBe(no_problematic_attributes)
    })
  })
  describe('given a file with no character attribute metadata', () => {
    it('should produce a rejected promise', () => {
      expect(
        checkForBrokenCharacterAttributesRelationships(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(missing_character_attribute_metadata)
      ).rejects.toThrow()
    })
  })
  describe('given a file with attribute metadata that has a missing id', () => {
    it('should produce a rejected promise', () => {
      expect(
        checkForBrokenCharacterAttributesRelationships(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(attribute_metadata_missing_id)
      ).rejects.toThrow()
    })
  })
  describe('given a file with attribute metadata that has a missing name', () => {
    it('should produce a rejected promise', () => {
      expect(
        checkForBrokenCharacterAttributesRelationships(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(attribute_metadata_missing_name)
      ).rejects.toThrow()
    })
  })
  describe('given a file with attribute metadata that has a missing type', () => {
    it('should produce a rejected promise', () => {
      expect(
        checkForBrokenCharacterAttributesRelationships(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(attribute_metadata_missing_type)
      ).rejects.toThrow()
    })
  })
  describe('given a file with attribute values that reference non-existant books', () => {
    it('should produce a rejected promise', () => {
      expect(
        checkForBrokenCharacterAttributesRelationships(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(attribute_values_reference_non_existant_books)
      ).rejects.toThrow()
    })
  })
  describe('given a file with duplicated character attribute values', () => {
    it('should produce a rejected promise', () => {
      expect(
        checkForBrokenCharacterAttributesRelationships(
          DUMMY_FILE_PATH,
          DUMMY_ACTION_TRAIL
        )(duplicated_attribute_values)
      ).rejects.toThrow()
    })
  })
})
