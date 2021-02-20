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
  const { heap, children, index } = tree
  if (parentId && !index[parentId]) return tree

  if (!index[node[idProp]]) {
    return {
      children: { parentId: [node[idProp], ...children[parentId]], ...children },
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

export const depth = ({ heap, index }, nodeId) => {
  if (!index[nodeId]) return undefined

  let depth = 0
  let current = heap[nodeId]
  while (current !== undefined && current !== null) {
    ++depth
    current = heap[current]
  }
  return depth
}

export const children = ({ index, heap }, nodeId) => {
  if (!index[nodeId]) return undefined

  return Object.entries(heap)
    .filter(([key, value]) => value == nodeId)
    .map(([key, value]) => index[key])
}
