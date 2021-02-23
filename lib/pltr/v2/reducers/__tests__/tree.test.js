import {
  addNode,
  findNode,
  nodeParent,
  depth,
  children,
  deleteNode,
  moveNode,
  filter,
  reduce as treeReduce,
} from '../tree'

describe('tree', () => {
  describe('given the idPropName "id"', () => {
    const add = addNode('id')
    const reduce = treeReduce('id')
    const emptyTree = { children: { null: [] }, heap: {}, index: {} }
    describe('and the empty tree', () => {
      it('filtering it should produce the empty tree', () => {
        expect(filter(emptyTree, () => {})).toEqual(emptyTree)
        expect(filter(emptyTree, () => true)).toEqual(emptyTree)
        expect(filter(emptyTree, () => false)).toEqual(emptyTree)
      })
      it('reducing over it should produce the initial value', () => {
        expect(reduce(emptyTree, (acc, next) => true, false)).toEqual(false)
      })
    })
    describe('given a tree with no children', () => {
      const tree = { children: { null: [1], 1: [] }, heap: { 1: null }, index: { 1: { id: 1 } } }
      describe('and a predicate which always produces true', () => {
        it('should produce the tree', () => {
          expect(filter(tree, () => true)).toEqual(tree)
        })
      })
      describe('and a predicate which always produces false', () => {
        it('should produce the empty tree', () => {
          expect(filter(tree, () => false)).toEqual(emptyTree)
        })
      })
      describe('and a predicate which matches the single node', () => {
        it('should produce the tree, unaltered', () => {
          expect(filter(tree, (node) => node.id === 1)).toEqual(tree)
        })
      })
      describe("and a predicate which doesn't match the node", () => {
        it('should produce the empty tree', () => {
          expect(filter(tree, (node) => node.id !== 1)).toEqual(emptyTree)
        })
      })
      describe('and a function which sums the id prop', () => {
        it('should produce 1', () => {
          expect(reduce(tree, (acc, { id }) => acc + id, 0)).toEqual(1)
        })
      })
      describe('and a function which counts the nodes', () => {
        it('should produce 1', () => {
          expect(reduce(tree, (acc, _next) => acc + 1, 0)).toEqual(1)
        })
      })
      it('should have children of the root node equal to just the one node', () => {
        expect(children(tree, null)).toEqual([{ id: 1 }])
      })
      it('the only node should have depth 1', () => {
        expect(depth(tree, 1)).toEqual(0)
      })
      it('the only node should have no children', () => {
        expect(children(tree, 1)).toEqual([])
      })
      it('should produce an empty tree when deleted', () => {
        const newTree = deleteNode(tree, 1)
        expect(findNode(newTree, 1)).toBeUndefined()
        expect(nodeParent(newTree, 1)).toBeUndefined()
        expect(children(newTree, 1)).toBeUndefined()
      })
      it("shouldn't be able to be moved", () => {
        expect(moveNode(tree, 1, 1)).toEqual(tree)
        expect(moveNode(tree, 1, null)).toEqual(tree)
        expect(moveNode(tree, 1, 4)).toEqual(tree)
        expect(moveNode(tree, null, 1)).toEqual(tree)
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
        it("shouldn't effect the tree when moved", () => {
          expect(moveNode(tree, 2, 1)).toEqual(tree)
          expect(moveNode(tree, 2, null)).toEqual(tree)
          expect(moveNode(tree, 2, 4)).toEqual(tree)
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
          null: [0, 1, 7, 8],
          0: [],
          1: [2],
          2: [3, 5],
          3: [4],
          4: [],
          5: [6],
          6: [],
          7: [],
          8: [9],
          9: [10, 11],
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
      describe('and a function which sums the id prop', () => {
        it('should produce 78', () => {
          expect(reduce(tree, (acc, { id }) => acc + id, 0)).toEqual(78)
        })
      })
      describe('and a function which counts the number of nodes', () => {
        it('should produce 13', () => {
          expect(reduce(tree, (acc, { id }) => acc + 1, 0)).toEqual(13)
        })
      })
      describe('and the predicate which always produces true', () => {
        it('should filter to the same tree', () => {
          expect(filter(tree, () => true)).toEqual(tree)
        })
      })
      describe('and the predicate which always produces false', () => {
        it('should filter to the empty tree', () => {
          expect(filter(tree, () => false)).toEqual(emptyTree)
        })
      })
      describe("and the predicate which doesn't match nodes 2 & 12", () => {
        it('should remove those nodes from the tree along with their children', () => {
          expect(findNode(tree, 12)).toBeDefined()
          expect(findNode(tree, 2)).toBeDefined()
          expect(children(tree, 1)).toEqual([{ id: 2 }])
          expect(findNode(tree, 3)).toBeDefined()
          expect(findNode(tree, 4)).toBeDefined()
          expect(findNode(tree, 5)).toBeDefined()
          expect(findNode(tree, 6)).toBeDefined()
          expect(children(tree, 11)).toEqual([{ id: 12 }])
          const newTree = filter(tree, ({ id }) => id !== 12 && id !== 2)
          expect(findNode(newTree, 12)).toBeUndefined()
          expect(findNode(newTree, 2)).toBeUndefined()
          expect(children(newTree, 1)).toEqual([])
          expect(findNode(newTree, 3)).toBeUndefined()
          expect(findNode(newTree, 4)).toBeUndefined()
          expect(findNode(newTree, 5)).toBeUndefined()
          expect(findNode(newTree, 6)).toBeUndefined()
          expect(children(newTree, 11)).toEqual([])
        })
      })
      describe('and the node id null', () => {
        it('should have children equal to all nodes at the top', () => {
          expect(children(tree, null)).toEqual([{ id: 0 }, { id: 1 }, { id: 7 }, { id: 8 }])
        })
      })
      describe('and the node id 0', () => {
        it('should have a depth of 0', () => {
          expect(depth(tree, 0)).toEqual(0)
        })
        it('should have no children', () => {
          expect(children(tree, 0)).toEqual([])
        })
        describe('when deleting it', () => {
          it('should remove id 0 from the tree', () => {
            expect(findNode(tree, 0)).toEqual({ id: 0 })
            expect(nodeParent(tree, 0)).toEqual(null)
            expect(children(tree, 0)).toEqual([])
            const newTree = deleteNode(tree, 0)
            expect(findNode(newTree, 0)).toBeUndefined()
            expect(nodeParent(newTree, 0)).toBeUndefined()
            expect(children(newTree, 0)).toBeUndefined()
            expect(children(newTree, null)).toEqual([{ id: 1 }, { id: 7 }, { id: 8 }])
          })
        })
        describe('and a destination parent of 1', () => {
          it('should make 0 a child of 1', () => {
            expect(nodeParent(tree, 0)).toEqual(null)
            expect(children(tree, null)).toEqual([{ id: 0 }, { id: 1 }, { id: 7 }, { id: 8 }])
            expect(children(tree, 1)).toEqual([{ id: 2 }])
            expect(depth(tree, 0)).toEqual(0)
            const newTree = moveNode(tree, 0, 1)
            expect(nodeParent(newTree, 0)).toEqual(1)
            expect(children(newTree, null)).toEqual([{ id: 1 }, { id: 7 }, { id: 8 }])
            expect(children(newTree, 1)).toEqual([{ id: 2 }, { id: 0 }])
            expect(depth(newTree, 0)).toEqual(1)
          })
        })
        describe('and a destination parent of 3', () => {
          it('should make 0 a child of 3', () => {
            expect(nodeParent(tree, 0)).toEqual(null)
            expect(children(tree, null)).toEqual([{ id: 0 }, { id: 1 }, { id: 7 }, { id: 8 }])
            expect(children(tree, 3)).toEqual([{ id: 4 }])
            expect(depth(tree, 0)).toEqual(0)
            const newTree = moveNode(tree, 0, 3)
            expect(nodeParent(newTree, 0)).toEqual(3)
            expect(children(newTree, null)).toEqual([{ id: 1 }, { id: 7 }, { id: 8 }])
            expect(children(newTree, 3)).toEqual([{ id: 4 }, { id: 0 }])
            expect(depth(newTree, 0)).toEqual(3)
          })
        })
      })
      describe('and the node id 1', () => {
        it('should have a depth of 0', () => {
          expect(depth(tree, 1)).toEqual(0)
        })
        it('should have one child', () => {
          expect(children(tree, 1)).toEqual([{ id: 2 }])
        })
        describe('when deleting it', () => {
          it("should remove both the node and it's children", () => {
            expect(findNode(tree, 1)).toEqual({ id: 1 })
            expect(nodeParent(tree, 1)).toEqual(null)
            expect(children(tree, 1)).toEqual([{ id: 2 }])
            const newTree = deleteNode(tree, 1)
            expect(findNode(newTree, 1)).toBeUndefined()
            expect(nodeParent(newTree, 1)).toBeUndefined()
            expect(children(newTree, 1)).toBeUndefined()
            expect(children(tree, 1).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 2).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 3).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 5).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 4).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 6).every((id) => !findNode(newTree, id))).toEqual(true)
          })
        })
      })
      describe('and the node id 2', () => {
        it('should have a depth of 1', () => {
          expect(depth(tree, 2)).toEqual(1)
        })
        it('should have two children', () => {
          expect(children(tree, 2)).toEqual([{ id: 3 }, { id: 5 }])
        })
        describe('when deleting it', () => {
          it("should remove bot hthe node and it's children", () => {
            expect(findNode(tree, 2)).toEqual({ id: 2 })
            expect(nodeParent(tree, 2)).toEqual(1)
            expect(children(tree, 2)).toEqual([{ id: 3 }, { id: 5 }])
            const newTree = deleteNode(tree, 2)
            expect(findNode(newTree, 2)).toBeUndefined()
            expect(nodeParent(newTree, 2)).toBeUndefined()
            expect(children(newTree, 2)).toBeUndefined()
            expect(children(tree, 2).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(newTree, 1)).toEqual([])
            expect(children(tree, 3).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 5).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 4).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 6).every((id) => !findNode(newTree, id))).toEqual(true)
          })
        })
      })
      describe('and the node id 3', () => {
        it('should have a depth of 2', () => {
          expect(depth(tree, 3)).toEqual(2)
        })
        it('should have one child', () => {
          expect(children(tree, 3)).toEqual([{ id: 4 }])
        })
        describe('when deleting it', () => {
          it("should remove bot hthe node and it's children", () => {
            expect(findNode(tree, 3)).toEqual({ id: 3 })
            expect(nodeParent(tree, 3)).toEqual(2)
            expect(children(tree, 3)).toEqual([{ id: 4 }])
            const newTree = deleteNode(tree, 3)
            expect(findNode(newTree, 3)).toBeUndefined()
            expect(nodeParent(newTree, 3)).toBeUndefined()
            expect(children(newTree, 3)).toBeUndefined()
            expect(children(newTree, 1)).toEqual(children(tree, 1))
            expect(children(newTree, 2)).toEqual([{ id: 5 }])
            expect(children(tree, 3).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 5).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 4).every((id) => !findNode(newTree, id))).toEqual(true)
            expect(children(tree, 6).every((id) => !findNode(newTree, id))).toEqual(true)
          })
        })
        describe('and a destination node of null', () => {
          it('should make 2 a root node', () => {
            expect(nodeParent(tree, 2)).toEqual(1)
            expect(children(tree, 1)).toEqual([{ id: 2 }])
            expect(children(tree, null)).toEqual([{ id: 0 }, { id: 1 }, { id: 7 }, { id: 8 }])
            expect(depth(tree, 2)).toEqual(1)
            const newTree = moveNode(tree, 2, null)
            expect(nodeParent(newTree, 2)).toEqual(null)
            expect(children(newTree, null)).toEqual([
              { id: 0 },
              { id: 1 },
              { id: 7 },
              { id: 8 },
              { id: 2 },
            ])
            expect(children(newTree, 1)).toEqual([])
            expect(depth(newTree, 2)).toEqual(0)
          })
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
