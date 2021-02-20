import { addNode } from '../heap'

describe('addNode', () => {
  describe('given the idPropName "id"', () => {
    const add = addNode('id')
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
    describe('given a tree with a deep hierarchy', () => {
      const tree = {
        id: 1,
        children: [
          {
            id: 2,
            children: [
              {
                id: 3,
                children: [{ id: 4, children: [] }],
              },
              {
                id: 5,
                children: [{ id: 6, chilren: [] }],
              },
            ],
          },
          {
            id: 7,
            children: [],
          },
          {
            id: 8,
            children: [
              {
                id: 9,
                children: [
                  {
                    id: 10,
                    children: [],
                  },
                  {
                    id: 11,
                    children: [
                      {
                        id: 12,
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
      describe('and a node to add', () => {
        const node = { id: 13, children: [] }
        describe('and a null parent id', () => {
          it('should not add the node to the tree', () => {
            expect(add(tree, null, node)).toEqual(tree)
          })
        })
        describe("and a parent id which doesn't exist in the tree", () => {
          it('should not add the node ot the tree', () => {
            expect(add(tree, 14, node)).toEqual(tree)
          })
        })
        describe('and a parent id on a leaf node', () => {
          it('should add the node to the correct leaf', () => {
            const newTree = add(tree, 6, node)
            expect()
          })
        })
        describe('and a parent id of an internal node', () => {
          it('should add the node to the internal node', () => {
            
          })
        })
      })
    })
  })
})
