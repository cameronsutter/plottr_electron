import { emptyFile } from 'pltr/v2'

import { uuidsToIntegerIds } from '../uuidsToIntegerIds'

describe('uuidsToIntegerIds', () => {
  describe('given an empty file', () => {
    it('should produce the empty file', () => {
      expect(uuidsToIntegerIds({})).toEqual({})
    })
  })
  describe('given a new file', () => {
    it('should produce the new file', () => {
      expect(emptyFile()).toEqual(emptyFile())
    })
  })
})
