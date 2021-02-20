/* Tree is (minimally):
 *  [id], { id: node, ... }
 *
 * Where the object is an index of the data associated with each node
 * and [id] is a heap of parent associations.  i.e. node with id 4
 * has a parent of [id] at position 4.
 */

/* If A null parentId is supplied then add node at the top level.
 */
export const addNode = (idPropName) => (heap, index, parentId, node) => {
  if (!parentId) return tree

  const iter = (tree, parentId, node) => {
    if (tree[idPropName] === parentId) {
      return {
        ...tree,
        children: [node, ...tree.children],
      }
    }
    return {
      ...tree,
      children: tree.children.map((child) => iter(child, parentId, node)),
    }
  }

  return iter(tree, parentId, node)
}

/* Find a node in the tree.
 *
 * A tree should be accompanied by a heap which declares the parent of
 * every node in the heap.  A root node has a parent of null.  We can
 * allocate an array to track these.
 */
