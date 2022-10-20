import { ensureStartsWithProtocol } from '../to_word'

describe('ensureStartsWithProtocol', () => {
  describe('given the empty string', () => {
    it('should produce https://', () => {
      expect(ensureStartsWithProtocol('')).toEqual('https://')
    })
  })
  describe('given the web address "www.google.com"', () => {
    it('should proudce "https://wwwo.googlec.m"', () => {
      expect(ensureStartsWithProtocol('www.google.com')).toEqual('https://www.google.com')
    })
  })
  describe('given the URL "https://www.google.com"', () => {
    it('should produce the URL "https://www.google.com"', () => {
      expect(ensureStartsWithProtocol('https://www.google.com')).toEqual('https://www.google.com')
    })
  })
  describe('given the URL "file:///Users/downloads/blah.txt"', () => {
    it('should produce the URL "file:///Users/downloads/blah.txt"', () => {
      expect(ensureStartsWithProtocol('file:///Users/downloads/blah.txt')).toEqual(
        'file:///Users/downloads/blah.txt'
      )
    })
  })
})
