import { children, newTree, nodeParent } from '../../reducers/tree'
import { beat } from '../../store/initialState'

import { addLevelToHierarchy, removeLevelFromHierarchy, adjustHierarchyLevels } from '../beats'

describe('addLevelToHierarchy', () => {
  describe('given the empty tree', () => {
    const emptyTree = newTree('id')
    it('should produce a new tree with one root level node', () => {
      const newTree = addLevelToHierarchy(emptyTree, 1, 1)
      expect(children(newTree, null)).toHaveLength(1)
      expect(nodeParent(newTree, 1)).toBeNull()
    })
  })
  describe('given a singleton tree', () => {
    const beatOne = { ...beat, id: 1, bookId: 1 }
    const singletonTree = {
      children: {
        1: [],
        null: [1],
      },
      heap: {
        1: null,
      },
      index: {
        1: beatOne,
      },
    }
    it('should add a new node at level zero and make the one node its child', () => {
      const newTree = addLevelToHierarchy(singletonTree, 2, 1)
      const beatTwo = { ...beat, id: 2, bookId: 1 }
      expect(children(newTree, null)).toHaveLength(1)
      expect(children(newTree, null)).toEqual(expect.arrayContaining([beatTwo]))
      expect(children(newTree, 1)).toEqual([])
      expect(children(newTree, 2)).toEqual(expect.arrayContaining([beatOne]))
      expect(nodeParent(newTree, 1)).toEqual(2)
      expect(nodeParent(newTree, 2)).toEqual(null)
    })
  })
  describe('given a more complicated tree', () => {
    const beatOne = { ...beat, id: 1, bookId: 1 }
    const beatTwo = { ...beat, id: 2, bookId: 1 }
    const beatThree = { ...beat, id: 3, bookId: 1 }
    const beatFour = { ...beat, id: 4, bookId: 1 }
    const beatFive = { ...beat, id: 5, bookId: 1 }
    const beatSix = { ...beat, id: 6, bookId: 1 }
    const complicatedTree = {
      children: {
        1: [2],
        2: [3],
        3: [],
        4: [5],
        5: [],
        null: [1, 4],
      },
      heap: {
        1: null,
        2: 1,
        3: 2,
        4: null,
        5: 4,
      },
      index: {
        1: beatOne,
        2: beatTwo,
        3: beatThree,
        4: beatFour,
        5: beatFive,
      },
    }
    it('should make all root nodes parents of the new node', () => {
      const newTree = addLevelToHierarchy(complicatedTree, 6, 1)
      expect(children(newTree, null)).toHaveLength(1)
      expect(children(newTree, null)).toEqual(expect.arrayContaining([beatSix]))
      expect(children(newTree, 6)).toEqual(expect.arrayContaining([beatOne, beatFour]))
      expect(nodeParent(newTree, 1)).toEqual(6)
      expect(nodeParent(newTree, 4)).toEqual(6)
      expect(nodeParent(newTree, 6)).toEqual(null)
    })
  })
})

describe('removeLevelFromHierarchy', () => {
  
})

describe('adjustHierarchyLevels', () => {
  
})
