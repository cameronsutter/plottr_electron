/* Tree is (minimally):
 *  { id }, { id: node, ... }
 *
 * Where the object is an index of the data associated with each node
 * and { id } is a heap of parent associations.  i.e. node with id 4
 * has a parent of { id } at key 4.
 */

/* If A null parentId is supplied then add node at the top level.
 */
export const addNode = (idProp) => (tree, parentId, node) => {
  const { heap, index } = tree
  if (parentId && !index[parentId]) return tree

  if (!index[node[idProp]]) {
    return {
      heap: { ...heap, [node[idProp]]: parentId },
      index: { [node[idProp]]: node },
    }
  }

  return tree
}

export const findNode = ({ index }, nodeId) => {
  return index[nodeId]
}

export const nodeParent = ({ heap }, nodeId) => {
  return heap[nodeId]
}

export const depth = ({ heap }, nodeId) => {
  return 0
}

export const children = ({ heap, index }, nodeId) => {
  return []
}
