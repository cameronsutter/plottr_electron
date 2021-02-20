import { addNode, findNode, nodeParent, depth, children, deleteNode, moveNode } from '../tree'

describe('tree', () => {
  describe('given the idPropName "id"', () => {
    const add = addNode('id')
    describe('given a tree with no children', () => {
      const tree = { children: { 1: [] }, heap: { 1: null }, index: { 1: { id: 1 } } }
      it('the only node should have depth 1', () => {
        expect(depth(tree, 1)).toEqual(0)
      })
      it('the only node should have no children', () => {
        expect(children(tree, 1)).toEqual([])
      })
      it('should produce an empty tree when deleted', () => {
        const newTree = deleteNode(tree, 1)
        expect(findNode(newTree, 1)).toEqual(undefined)
        expect(nodeParent(newTree, 1)).toEqual(undefined)
        expect(children(newTree, 1)).toEqual(undefined)
      })
      describe("given a node id which isn't in the tree", () => {
        it('should produce undefined', () => {
          expect(depth(tree, 2)).toBeUndefined()
        })
        it('should have an undefined collection of children', () => {
          expect(children(tree, 2)).toBeUndefined()
        })
        it("shouldn't delete anything", () => {
          expect(deleteNode(tree, 2)).toEqual(tree)
        })
      })
      describe('and a node to add', () => {
        const node = { id: 2 }
        describe('and a null parent id', () => {
          it('should add the node with a null parent id', () => {
            expect(findNode(tree, 2)).toBeUndefined()
            expect(nodeParent(tree, 2)).toBeUndefined()
            expect(children(tree, 2)).toBeUndefined()
            const newTree = add(tree, null, node)
            expect(findNode(newTree, 2)).toEqual(node)
            expect(nodeParent(newTree, 2)).toEqual(null)
            expect(children(newTree, 2)).toEqual([])
            expect(children(newTree, 1)).toEqual([])
          })
        })
        describe('and a parent id other than the current parent id', () => {
          it('should not add the node to the tree', () => {
            expect(add(tree, 4, node)).toEqual(tree)
          })
        })
        describe('and a parent id which is in the tree', () => {
          it('should add the node to the tree with the correct parent node', () => {
            expect(findNode(tree, 2)).toBeUndefined()
            expect(nodeParent(tree, 2)).toBeUndefined()
            expect(children(tree, 2)).toBeUndefined()
            const newTree = add(tree, 1, node)
            expect(findNode(newTree, 2)).toEqual(node)
            expect(nodeParent(newTree, 2)).toEqual(1)
            expect(children(newTree, 2)).toEqual([])
            expect(children(newTree, 1)).toEqual([{ id: 2 }])
          })
        })
      })
    })
    describe('given a tree with a deep hierarchy', () => {
      const tree = {
        children: {
          0: [],
          1: [2],
          2: [3, 5],
          3: [4],
          4: [],
          5: [6],
          6: [],
          7: [],
          8: [9],
          10: [],
          11: [12],
          12: [],
        },
        heap: {
          0: null,
          1: null,
          2: 1,
          3: 2,
          4: 3,
          5: 2,
          6: 5,
          7: null,
          8: null,
          9: 8,
          10: 9,
          11: 9,
          12: 11,
        },
        index: {
          0: { id: 0 },
          1: { id: 1 },
          2: { id: 2 },
          3: { id: 3 },
          4: { id: 4 },
          5: { id: 5 },
          6: { id: 6 },
          7: { id: 7 },
          8: { id: 8 },
          9: { id: 9 },
          10: { id: 10 },
          11: { id: 11 },
          12: { id: 12 },
        },
      }
      describe('and the node id 0', () => {
        it('should have a depth of 0', () => {
          expect(depth(tree, 0)).toEqual(0)
        })
        it('should have no children', () => {
          expect(children(tree, 0)).toEqual([])
        })
      })
      describe('and the node id 1', () => {
        it('should have a depth of 0', () => {
          expect(depth(tree, 1)).toEqual(0)
        })
        it('should have one child', () => {
          expect(children(tree, 1)).toEqual([{ id: 2 }])
        })
      })
      describe('and the node id 2', () => {
        it('should have a depth of 1', () => {
          expect(depth(tree, 2)).toEqual(1)
        })
        it('should have two children', () => {
          expect(children(tree, 2)).toEqual([{ id: 3 }, { id: 5 }])
        })
      })
      describe('and the node id 3', () => {
        it('should have a depth of 2', () => {
          expect(depth(tree, 3)).toEqual(2)
        })
        it('should have one child', () => {
          expect(children(tree, 3)).toEqual([{ id: 4 }])
        })
      })
      describe('and a node to add', () => {
        const node = { id: 13 }
        describe('and a null parent id', () => {
          it('should add the node to the tree at the root', () => {
            expect(findNode(tree, 13)).toBeUndefined()
            expect(nodeParent(tree, 13)).toBeUndefined()
            expect(children(tree, 13)).toBeUndefined()
            const newTree = add(tree, null, node)
            expect(findNode(newTree, 13)).toEqual(node)
            expect(nodeParent(newTree, 13)).toEqual(null)
            expect(children(newTree, 13)).toEqual([])
          })
        })
        describe("and a parent id which doesn't exist in the tree", () => {
          it('should not add the node to the tree', () => {
            expect(add(tree, 14, node)).toEqual(tree)
          })
        })
        describe('and a parent id on a leaf node', () => {
          it('should add the node to the correct leaf', () => {
            expect(findNode(tree, 13)).toBeUndefined()
            expect(nodeParent(tree, 13)).toBeUndefined()
            expect(children(tree, 6)).toEqual([])
            const newTree = add(tree, 6, node)
            expect(findNode(newTree, 13)).toEqual(node)
            expect(nodeParent(newTree, 13)).toEqual(6)
            expect(children(newTree, 6)).toEqual([{ id: 13 }])
          })
        })
        describe('and a parent id of an internal node', () => {
          it('should add the node to the internal node', () => {
            expect(findNode(tree, 13)).toBeUndefined()
            expect(nodeParent(tree, 13)).toBeUndefined()
            expect(children(tree, 3)).toEqual([{ id: 4 }])
            const newTree = add(tree, 3, node)
            expect(findNode(newTree, 13)).toEqual(node)
            expect(nodeParent(newTree, 13)).toEqual(3)
            expect(children(newTree, 3)).toEqual(expect.arrayContaining([{ id: 4 }, { id: 13 }]))
          })
        })
      })
    })
  })
})
