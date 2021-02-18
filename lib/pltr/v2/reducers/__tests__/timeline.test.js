import timelineReducer from '../timelines'
import beatsReducer from '../beats'
import { newFileTimelines, newFileTimeline } from '../../store/newFileState'
import {
  ADD_HIERARCHY_LEVEL,
  ASSIGN_BEAT_TO_HIERARCHY,
  DELETE_HIERARCHY_LEVEL,
} from '../../constants/ActionTypes'
import { chapter } from '../../store/initialState'

describe('timelineReducer', () => {
  describe('given no initial state', () => {
    describe('and any action which is not a timeline action', () => {
      it('should produce the initial file state', () => {
        expect(timelineReducer(undefined, { type: 'SOME_OTHER_TYPE' })).toEqual(newFileTimelines)
      })
    })
    describe('and the add action type', () => {
      describe('and the book id 1', () => {
        const action = { type: ADD_HIERARCHY_LEVEL, bookId: 1 }
        it('should enclose the current hierarchy in another level', () => {
          const newTimelineState = timelineReducer(undefined, action)
          expect(newTimelineState.hierarchy).toEqual(
            expect.arrayContaining({
              ...newFileTimeline,
              hierarchy: [
                {
                  level: 1,
                  beatId: 3,
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
    describe('and the delete action type', () => {
      describe('and the book id 1', () => {
        describe('and the hierarchy level of 0', () => {
          const action = { type: DELETE_HIERARCHY_LEVEL, bookId: 1, levelId: 0 }
          it('should produce an empty hierarchy', () => {
            const newTimelineState = timelineReducer(undefined, action)
            expect(newTimelineState).toEqual(
              expect.arrayContaining({
                ...newFileTimeline,
                hierarchy: [],
              })
            )
          })
          it('should also delete the corresponding beats', () => {
            const newBeatsState = beatsReducer(undefined, action)
            expect(newBeatsState).not.toEqual(expect.arrayContaining(chapter))
          })
        })
        describe('and the hierarchy level of 1', () => {
          const action = { type: DELETE_HIERARCHY_LEVEL, bookId: 1, levelId: 1 }
          it('should leave the hierarchy unchanged', () => {
            const newTimelineState = timelineReducer(undefined, action)
            expect(newTimelineState).teEqual(newFileTimeline)
          })
          it('should also leave the beats alone', () => {
            const newBeatsState = beatsReducer(undefined, action)
            expect(newBeatsState).toEqual(expect.arrayContaining(chapter))
          })
        })
      })
    })
    describe('and the assign action type', () => {
      describe('and the timeline id 2', () => {
        describe('and the beat id 4', () => {
          it('should add the beat id 4 to that hierarchy', () => {
            const action = { type: ASSIGN_BEAT_TO_HIERARCHY, bookId: 1, parentBeat: 1, beatId: 4 }
            const newTimelineState = timelineReducer(undefined, action)
            expect(newTimelineState).toEqual(
              expect.arrayContaining({
                ...newFileTimeline,
                hierarchy: [
                  {
                    ...newFileTimeline.hierarchy[0],
                    children: [
                      ...newFileTimeline.hierarchy[0].children,
                      { level: 0, beatId: 4, children: [] },
                    ],
                  },
                ],
              })
            )
          })
        })
      })
    })
  })
  describe('given a state with a timeline containing a two-level hierarchy', () => {
    describe('and the add action type', () => {
      describe('and the book id 1', () => {
        it('should enclose the level 1 of the hierarchy in the same parent', () => {
          
        })
      })
    })
    describe('and the delete action type', () => {
      describe('with the book id 1', () => {
        describe('and the level id 0', () => {
          it('should remove all of the children which have level 0 in book 1s hierarchy', () => {
            
          })
        })
        describe('and the level id 1', () => {
          it('should remove all of the children which have level 1 and 0 in book 1s hierarchy', () => {
            
          })
        })
      })
    })
    describe('and the assign action type', () => {
      describe('with the book id 1', () => {
        describe('and the parent beat id 8', () => {
          it('should add this beat as a child of beat 8 in book 1s hierarchy', () => {
            
          })
        })
      })
      describe('with the book id 2', () => {
        describe('and the parent beat id 8', () => {
          it('should do nothing because beat 8 is not in book 2s hierarchy', () => {
            
          })
        })
      })
      describe('with book id 2', () => {
        describe('and child beat id 4', () => {
          describe('and the parent beat id 7', () => {
            it('should move the beat from book 1 into book 2 as a child of beat 7', () => {
              
            })
          })
        })
      })
    })
  })
})
