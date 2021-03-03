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
})

describe('removeLevelFromHierarchy', () => {
  
})

describe('adjustHierarchyLevels', () => {
  
})
