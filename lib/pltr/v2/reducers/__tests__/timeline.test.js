import timelineReducer from '../timelines'
import beatsReducer from '../beats'
import { newFileTimelines, newFileTimeline } from '../../store/newFileState'
import { ADD_HIERARCHY_LEVEL } from '../../constants/ActionTypes'

describe('timelineReducer', () => {
  describe('given no initial state', () => {
    describe('and any action which is not a timeline action', () => {
      it('should produce the initial file state', () => {
        expect(timelineReducer(undefined, { type: 'SOME_OTHER_TYPE' })).toEqual(newFileTimelines)
      })
    })
    describe('and the add action type', () => {
      describe('and an id for the book with id 1', () => {
        const action = { type: ADD_HIERARCHY_LEVEL, bookId: 1 }
        it('should enclose the current hierarchy in another level', () => {
          const newTimelineState = timelineReducer(undefined, action)
          expect(newTimelineState.hierarchy).toEqual(
            expect.arrayContaining({
              ...newFileTimeline,
              hierarchy: [
                {
                  level: 1,
                  beatIds: [3],
                  children: [newFileTimeline.hierarchy],
                },
              ],
            })
          )
        })
        it('the action should also create a corresponding beat', () => {
          const newBeatsState = beatsReducer(undefined, action)
          const newLevelBeat = {
            id: 3,
            bookId: 1,
            position: 1,
            title: 'auto',
            time: 0,
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
          }
          expect(newBeatsState).toEqual(expect.arrayContaining(newLevelBeat))
        })
      })
    })
  })
})
