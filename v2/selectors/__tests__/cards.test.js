import { newTree } from '../../reducers/tree'
import { collapsedBeatSelector } from '../cards'

describe('collapsedBeatSelector', () => {
  describe('given an empty beat tree', () => {
    const emptyBeatTree = newTree('id')
    const state = {
      beats: {
        1: emptyBeatTree,
      },
      ui: {
        currentTimeline: 1,
      },
    }
    it('should produce an empty map', () => {
      const collapsedBeats = collapsedBeatSelector(state)
      expect(collapsedBeats.size).toEqual(0)
    })
  })
  describe('given a singleton beat tree', () => {
    describe('where that beat is not collapsed', () => {
      const tree = {
        children: {
          null: [1],
          1: [],
        },
        heap: {
          1: null,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('should produce a single entry map, whose sole value is null', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(1)
        expect(collapsedBeats.get(1)).toEqual(null)
      })
    })
    describe('where that beat is collapsed', () => {
      const tree = {
        children: {
          null: [1],
          1: [],
        },
        heap: {
          1: null,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('should produce a single entry map, whose sole value is itself', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(1)
        expect(collapsedBeats.get(1)).toEqual(1)
      })
    })
  })
  describe('given a two element tree', () => {
    describe('where both beats do not have parents', () => {
      describe('and no beats are collapsed', () => {
        const tree = {
          children: {
            null: [1, 2],
            1: [],
            2: [],
          },
          heap: {
            1: null,
            2: null,
          },
          index: {
            1: {
              id: 1,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: true,
            },
            2: {
              id: 2,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: true,
            },
          },
        }
        const state = {
          beats: {
            1: tree,
          },
          ui: {
            currentTimeline: 1,
          },
        }
        it('should produce a two entry map, whose values are both null', () => {
          const collapsedBeats = collapsedBeatSelector(state)
          expect(collapsedBeats.size).toEqual(2)
          expect(collapsedBeats.get(1)).toEqual(null)
          expect(collapsedBeats.get(2)).toEqual(null)
        })
      })
      describe('and one beat is collapsed', () => {
        const tree = {
          children: {
            null: [1, 2],
            1: [],
            2: [],
          },
          heap: {
            1: null,
            2: null,
          },
          index: {
            1: {
              id: 1,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: false,
            },
            2: {
              id: 2,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: true,
            },
          },
        }
        const state = {
          beats: {
            1: tree,
          },
          ui: {
            currentTimeline: 1,
          },
        }
        it('should produce a two entry map, where only one beat is collapsed', () => {
          const collapsedBeats = collapsedBeatSelector(state)
          expect(collapsedBeats.size).toEqual(2)
          expect(collapsedBeats.get(1)).toEqual(1)
          expect(collapsedBeats.get(2)).toEqual(null)
        })
      })
    })
    describe("where one beat is the other's parent", () => {
      describe('and no beats are collapsed', () => {
        const tree = {
          children: {
            null: [1],
            1: [2],
            2: [],
          },
          heap: {
            1: null,
            2: 1,
          },
          index: {
            1: {
              id: 1,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: true,
            },
            2: {
              id: 2,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: true,
            },
          },
        }
        const state = {
          beats: {
            1: tree,
          },
          ui: {
            currentTimeline: 1,
          },
        }
        it('should produce a two entry map, whose values are both null', () => {
          const collapsedBeats = collapsedBeatSelector(state)
          expect(collapsedBeats.size).toEqual(2)
          expect(collapsedBeats.get(1)).toEqual(null)
          expect(collapsedBeats.get(2)).toEqual(null)
        })
      })
      describe('and the child is collapsed', () => {
        const tree = {
          children: {
            null: [1],
            1: [2],
            2: [],
          },
          heap: {
            1: null,
            2: 1,
          },
          index: {
            1: {
              id: 1,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: true,
            },
            2: {
              id: 2,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: false,
            },
          },
        }
        const state = {
          beats: {
            1: tree,
          },
          ui: {
            currentTimeline: 1,
          },
        }
        it('should produce a two entry map, where only the child is collapsed', () => {
          const collapsedBeats = collapsedBeatSelector(state)
          expect(collapsedBeats.size).toEqual(2)
          expect(collapsedBeats.get(1)).toEqual(null)
          expect(collapsedBeats.get(2)).toEqual(2)
        })
      })
      describe('and the parent is collapsed', () => {
        const tree = {
          children: {
            null: [1],
            1: [2],
            2: [],
          },
          heap: {
            1: null,
            2: 1,
          },
          index: {
            1: {
              id: 1,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: false,
            },
            2: {
              id: 2,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: true,
            },
          },
        }
        const state = {
          beats: {
            1: tree,
          },
          ui: {
            currentTimeline: 1,
          },
        }
        it('should produce a two entry map, where the child and parent reference the parent', () => {
          const collapsedBeats = collapsedBeatSelector(state)
          expect(collapsedBeats.size).toEqual(2)
          expect(collapsedBeats.get(1)).toEqual(1)
          expect(collapsedBeats.get(2)).toEqual(1)
        })
      })
      describe('and both the parent and the child are collapsed', () => {
        const tree = {
          children: {
            null: [1],
            1: [2],
            2: [],
          },
          heap: {
            1: null,
            2: 1,
          },
          index: {
            1: {
              id: 1,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: false,
            },
            2: {
              id: 2,
              bookId: 'series',
              position: 0,
              title: 'auto',
              time: 0, // ? can also be a string
              templates: [],
              autoOutlineSort: true,
              fromTemplateId: null,
              expanded: false,
            },
          },
        }
        const state = {
          beats: {
            1: tree,
          },
          ui: {
            currentTimeline: 1,
          },
        }
        it('should produce a two entry map, where the child and parent reference the parent', () => {
          const collapsedBeats = collapsedBeatSelector(state)
          expect(collapsedBeats.size).toEqual(2)
          expect(collapsedBeats.get(1)).toEqual(1)
          expect(collapsedBeats.get(2)).toEqual(1)
        })
      })
    })
  })
  describe('given a three-deep tree', () => {
    describe('where no beats are collapsed', () => {
      const tree = {
        children: {
          null: [1],
          1: [2],
          2: [3],
          3: [],
        },
        heap: {
          1: null,
          2: 1,
          3: 2,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          2: {
            id: 2,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          3: {
            id: 3,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('should produce a three entry map, whose values are all null', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(3)
        expect(collapsedBeats.get(1)).toEqual(null)
        expect(collapsedBeats.get(2)).toEqual(null)
        expect(collapsedBeats.get(3)).toEqual(null)
      })
    })
    describe('where only the leaf is collapsed', () => {
      const tree = {
        children: {
          null: [1],
          1: [2],
          2: [3],
          3: [],
        },
        heap: {
          1: null,
          2: 1,
          3: 2,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          2: {
            id: 2,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          3: {
            id: 3,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('should produce a three entry map, where the leaf references itself', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(3)
        expect(collapsedBeats.get(1)).toEqual(null)
        expect(collapsedBeats.get(2)).toEqual(null)
        expect(collapsedBeats.get(3)).toEqual(3)
      })
    })
    describe('where only the middle rung is collapsed', () => {
      const tree = {
        children: {
          null: [1],
          1: [2],
          2: [3],
          3: [],
        },
        heap: {
          1: null,
          2: 1,
          3: 2,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          2: {
            id: 2,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
          3: {
            id: 3,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('should produce a three entry map, where the leaf references itself', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(3)
        expect(collapsedBeats.get(1)).toEqual(null)
        expect(collapsedBeats.get(2)).toEqual(2)
        expect(collapsedBeats.get(3)).toEqual(2)
      })
    })
    describe('where only the parent is collapsed', () => {
      const tree = {
        children: {
          null: [1],
          1: [2],
          2: [3],
          3: [],
        },
        heap: {
          1: null,
          2: 1,
          3: 2,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
          2: {
            id: 2,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          3: {
            id: 3,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('should produce a three entry map, where all nodes reference the parent', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(3)
        expect(collapsedBeats.get(1)).toEqual(1)
        expect(collapsedBeats.get(2)).toEqual(1)
        expect(collapsedBeats.get(3)).toEqual(1)
      })
    })
    describe('where the middle and leaf are collapsed', () => {
      const tree = {
        children: {
          null: [1],
          1: [2],
          2: [3],
          3: [],
        },
        heap: {
          1: null,
          2: 1,
          3: 2,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          2: {
            id: 2,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
          3: {
            id: 3,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('should produce a three entry map, where the leaf and middle reference the middle', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(3)
        expect(collapsedBeats.get(1)).toEqual(null)
        expect(collapsedBeats.get(2)).toEqual(2)
        expect(collapsedBeats.get(3)).toEqual(2)
      })
    })
    describe('where the parent and the middle are collapsed', () => {
      const tree = {
        children: {
          null: [1],
          1: [2],
          2: [3],
          3: [],
        },
        heap: {
          1: null,
          2: 1,
          3: 2,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
          2: {
            id: 2,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
          3: {
            id: 3,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('should produce a three entry map, where all nodes reference the root', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(3)
        expect(collapsedBeats.get(1)).toEqual(1)
        expect(collapsedBeats.get(2)).toEqual(1)
        expect(collapsedBeats.get(3)).toEqual(1)
      })
    })
  })
  describe('given a tree with two branches', () => {
    describe('and only one branch is collapsed', () => {
      const tree = {
        children: {
          null: [1, 4],
          1: [2],
          2: [3],
          3: [],
          4: [5],
          5: [6],
          6: [],
        },
        heap: {
          1: null,
          2: 1,
          3: 2,
          4: null,
          5: 4,
          6: 5,
        },
        index: {
          1: {
            id: 1,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          2: {
            id: 2,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          3: {
            id: 3,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          4: {
            id: 4,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: false,
          },
          5: {
            id: 5,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
          6: {
            id: 6,
            bookId: 'series',
            position: 0,
            title: 'auto',
            time: 0, // ? can also be a string
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
            expanded: true,
          },
        },
      }
      const state = {
        beats: {
          1: tree,
        },
        ui: {
          currentTimeline: 1,
        },
      }
      it('produce a map containing all nodes where only the collapsed branch is collapsed', () => {
        const collapsedBeats = collapsedBeatSelector(state)
        expect(collapsedBeats.size).toEqual(6)
        expect(collapsedBeats.get(1)).toEqual(null)
        expect(collapsedBeats.get(2)).toEqual(null)
        expect(collapsedBeats.get(3)).toEqual(null)
        expect(collapsedBeats.get(4)).toEqual(4)
        expect(collapsedBeats.get(5)).toEqual(4)
        expect(collapsedBeats.get(6)).toEqual(4)
      })
    })
  })
})
