import { emptyFile } from 'pltr/v2'

import { Goldilocks } from './fixtures'
import { uuidsToIntegerIds } from '../uuidsToIntegerIds'

describe('uuidsToIntegerIds', () => {
  describe('given an empty file', () => {
    it('should produce the empty file', () => {
      expect(uuidsToIntegerIds({})).toEqual({})
    })
  })
  describe('given a new file', () => {
    it('should produce the new file', () => {
      expect(uuidsToIntegerIds(emptyFile())).toEqual(emptyFile())
    })
  })
  describe('given a valid example file', () => {
    it('should produce that file unchanged', () => {
      expect(uuidsToIntegerIds(Goldilocks)).toEqual(Goldilocks)
    })
  })
})
