import { notOnFirstLine } from '../notOnFirstLine'

describe('notOnFirstLine', () => {
  describe('a null selection', () => {
    it('should produce false', () => {
      expect(notOnFirstLine(null)).toEqual(false)
    })
  })
  describe('a selection where the anchor equals the focus', () => {
    describe('and the anchor is on the first line', () => {
      const aSelectionOnTheFirstLine = {
        anchor: {
          path: [0, 0],
          offset: 0,
        },
        focus: {
          path: [0, 0],
          offset: 0,
        },
      }
      it('should produce false', () => {
        expect(notOnFirstLine(aSelectionOnTheFirstLine)).toBeFalsy()
      })
    })
    describe('and the anchor is not on the first line', () => {
      const aSelectionOnAnotherLine = {
        anchor: {
          path: [1, 0],
          offset: 0,
        },
        focus: {
          path: [1, 0],
          offset: 0,
        },
      }
      it('should produce true', () => {
        expect(notOnFirstLine(aSelectionOnAnotherLine)).toBeTruthy()
      })
    })
  })
  describe('given a selection with a different anchor from focus', () => {
    const aSelectionWithADifferentAnchorFromFocus = {
      anchor: {
        path: [1, 0],
        offset: 0,
      },
      focus: {
        path: [3, 0],
        offset: 0,
      },
    }
    it('should produce false', () => {
      expect(notOnFirstLine(aSelectionWithADifferentAnchorFromFocus)).toBeFalsy()
    })
  })
})
