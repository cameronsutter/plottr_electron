import { endsWith } from 'lodash'
import { readOutput, TEST_OUTPUT } from './common'

function isAnObject(val) {
  if (val && val instanceof Object) {
    return true
  } else {
    return false
  }
}

describe('ImportScrivener', () => {
  const testOutput = readOutput()

  describe('file', () => {
    it('should produce a .pltr file', () => {
      expect(endsWith(TEST_OUTPUT, '.pltr')).toBeTruthy()
    })
  })

  describe('json', () => {
    it('should produce a json object', () => {
      expect(isAnObject(testOutput)).toBeTruthy()
    })

    it('should produce a json object', () => {
      expect(isAnObject(testOutput)).toBeTruthy()
    })

    it('should have a ui object', () => {
      expect(testOutput.ui).toBeDefined()
    })

    it('should have a file object', () => {
      expect(testOutput.file).toBeDefined()
    })

    it('should have a series object', () => {
      expect(testOutput.series).toBeDefined()
    })

    it('should have a books object', () => {
      expect(testOutput.books).toBeDefined()
    })

    it('should have a beats object', () => {
      expect(testOutput.beats).toBeDefined()
    })

    it('should have a customAttributes object', () => {
      expect(testOutput.customAttributes).toBeDefined()
    })

    it('should have a categories object', () => {
      expect(testOutput.categories).toBeDefined()
    })

    it('should have a hierarchyLevels object', () => {
      expect(testOutput.hierarchyLevels).toBeDefined()
    })

    it('should have an array of characters', () => {
      expect(testOutput.characters).toBeDefined()
      expect(Array.isArray(testOutput.characters)).toBeTruthy()
    })

    it('should have an array of lines', () => {
      expect(testOutput.lines).toBeDefined()
      expect(Array.isArray(testOutput.lines)).toBeTruthy()
    })

    it('should have an array of cards', () => {
      expect(testOutput.cards).toBeDefined()
      expect(Array.isArray(testOutput.cards)).toBeTruthy()
    })

    it('should have an array of places', () => {
      expect(testOutput.places).toBeDefined()
      expect(Array.isArray(testOutput.places)).toBeTruthy()
    })

    it('should have an array of tags', () => {
      expect(testOutput.tags).toBeDefined()
      expect(Array.isArray(testOutput.tags)).toBeTruthy()
    })
  })
})
