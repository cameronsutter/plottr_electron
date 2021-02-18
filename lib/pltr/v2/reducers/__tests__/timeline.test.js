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
          const action = { type: DELETE_HIERARCHY_LEVEL, bookId: 1, level: 0 }
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
          const action = { type: DELETE_HIERARCHY_LEVEL, bookId: 1, level: 1 }
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
  describe('given a state with a timeline containing a three-level hierarchy', () => {
    const threeLevelHierarchyState = [
      {
        id: 1,
        type: 'book',
        bookId: '1',
        hierarchy: [
          {
            beatId: 8,
            level: 2,
            children: [
              {
                level: 1,
                beatId: 4,
                children: [{ beatId: 1, level: 0, children: [] }],
              },
              {
                level: 1,
                beatId: 5,
                children: [{ beatId: 9, level: 0, children: [] }],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        type: 'series',
        bookId: 'series',
        hierarchy: [{ beatId: 2, level: 0, children: [] }],
      },
      {
        id: 3,
        type: 'book',
        bookId: '2',
        hierarchy: [
          {
            beatId: 6,
            level: 1,
            children: [
              {
                level: 0,
                beatId: 3,
                children: [],
              },
              {
                level: 0,
                beatId: 7,
                children: [],
              },
            ],
          },
        ],
      },
    ]
    describe('and the add action type', () => {
      describe('and the book id 1', () => {
        it('should enclose the level 1 of the hierarchy in the same parent and leave others alone', () => {
          const action = { type: ADD_HIERARCHY_LEVEL, bookId: 1 }
          const newTimelineState = timelineReducer(threeLevelHierarchyState, action)
          const timelineForBook1 = newTimelineState.find(({ bookId }) => bookId === '1')
          const timelineForBook2 = newTimelineState.find(({ bookId }) => bookId === '2')
          const timelineForBookSeries = newTimelineState.find(({ bookId }) => bookId === 'series')
          // Leaves the others alone
          expect(timelineForBook2).toEqual(threeLevelHierarchyState[2])
          expect(timelineForBookSeries).toEqual(threeLevelHierarchyState[1])
          // Wraps the children of 1
          expect(timelineForBook1.hierarchy).toHaveLength(1)
          expect(timelineForBook1.hierarchy[0].level).toEqual(3)
          expect(timelineForBook1.hierarchy[0].children).toHaveLength(1)
          expect(timelineForBook1.hierarchy[0].children[0]).toEqual(
            threeLevelHierarchyState[0].hierarchy[0]
          )
        })
      })
      describe('and the book id 2', () => {
        it('should enclose the level 1 of the hierarchy in the same parent', () => {
          const action = { type: ADD_HIERARCHY_LEVEL, bookId: 2 }
          const newTimelineState = timelineReducer(threeLevelHierarchyState, action)
          const timelineForBook1 = newTimelineState.hierarchy.find(({ bookId }) => bookId === '1')
          const timelineForBook2 = newTimelineState.hierarchy.find(({ bookId }) => bookId === '2')
          const timelineForBookSeries = newTimelineState.hierarchy.find(
            ({ bookId }) => bookId === 'series'
          )
          // Leaves the others alone
          expect(timelineForBook1).toEqual(threeLevelHierarchyState[0])
          expect(timelineForBookSeries).toEqual(threeLevelHierarchyState[1])
          // Wraps the children of 1
          expect(timelineForBook2.hierarchy).toHaveLength(1)
          expect(timelineForBook2.hierarchy[0].level).toEqual(2)
          expect(timelineForBook2.hierarchy[0].children).toHaveLength(1)
          expect(timelineForBook2.hierarchy[0].children[0]).toEqual(
            threeLevelHierarchyState[2].hierarchy[0]
          )
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
