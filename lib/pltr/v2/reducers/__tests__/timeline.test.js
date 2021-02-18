import timelineReducer from '../timelines'
import { newFileTimelines } from '../../store/newFileState'

describe('timelineReducer', () => {
  describe('given no initial state', () => {
    describe('and any action which is not a timeline action', () => {
      it('should produce the initial file state', () => {
        expect(timelineReducer(undefined, { type: 'SOME_OTHER_TYPE' })).toEqual(newFileTimelines)
      })
    })
  })
})
