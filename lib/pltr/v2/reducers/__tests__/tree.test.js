import { addNode } from '../tree'

describe('addNode', () => {
  describe('given the idPropName "id"', () => {
    const add = addNode('id')
    describe('given a null tree', () => {
      const tree = null
      describe('and a node to add', () => {
        const node = {
          id: 1,
          children: [],
        }
        describe('and a null parent id', () => {
          it('should produce that node as the tree', () => {
            expect(add(tree, null, node)).toEqual(node)
          })
        })
        describe('and a parent id of 0', () => {
          it('should produce that node as the tree', () => {
            expect(add(tree, 0, node)).toEqual(node)
          })
        })
      })
    })
    describe('given a tree with no children', () => {
      const tree = { id: 1, children: [] }
      describe('and a node to add', () => {
        const node = {
          id: 2,
          children: [],
        }
        describe('and a null parent id', () => {
          it('should not add the node to the tree', () => {
            expect(add(tree, null, node)).toEqual(tree)
          })
        })
        describe('and a parent id other than the current parent id', () => {
          it('should not add the node to the tree', () => {
            expect(add(tree, 4, node)).toEqual(tree)
          })
        })
        describe("and a parent id which equals the tree's id", () => {
          it('should add the node to the tree as an immediate child', () => {
            expect(add(tree, 1, node).children).toEqual(expect.arrayContaining([node]))
          })
        })
      })
    })
  })
})
