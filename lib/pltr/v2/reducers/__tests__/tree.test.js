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
  })
})
