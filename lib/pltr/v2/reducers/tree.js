import { clone } from 'lodash'

/* Tree is (minimally):
 *  { id }, { id: node, ... }, { id: [{ id }],... }
 *
 * Where the object is an index of the data associated with each node
 * and { id } is a heap of parent associations.  i.e. node with id 4
 * has a parent of { id } at key 4.  The third object is a tree of
 * child associations.
 *
 * The root node is null.  i.e. children(null) => all top level nodes
 * in the hierarchy.
 */

export const children = ({ children, index }, nodeId) => {
  if (index[nodeId] === undefined && nodeId !== null) return undefined

  return children[nodeId].map((key) => index[key])
}

/* If A null parentId is supplied then add node at the top level.
 */
export const addNode = (idProp) => (tree, parentId, node) => {
  const { heap, index } = tree
  if (parentId && !index[parentId]) return tree

  if (!index[node[idProp]]) {
    const parentChildren = children(tree, parentId)
    return {
      children: {
        ...tree.children,
        ...(parentChildren ? { [parentId]: [...tree.children[parentId], node[idProp]] } : {}),
        [node[idProp]]: [],
      },
      heap: { ...heap, [node[idProp]]: parentId },
      index: { ...tree.index, [node[idProp]]: node },
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
  if (index[nodeId] === undefined && nodeId !== null) return undefined

  let depth = 0
  let current = heap[nodeId]
  while (current !== undefined && current !== null) {
    ++depth
    current = heap[current]
  }
  return depth
}

export const deleteNode = (tree, nodeId) => {
  if (!tree.index[nodeId]) return tree

  const parentId = nodeParent(tree, nodeId)
  const newTree = {
    children: clone({
      ...tree.children,
      ...(parentId !== undefined
        ? { [parentId]: tree.children[parentId].filter((id) => id !== nodeId) }
        : {}),
    }),
    heap: clone(tree.heap),
    index: clone(tree.index),
  }
  const toDelete = [nodeId]
  while (toDelete.length) {
    const idToDelete = toDelete.pop()
    tree.children[idToDelete].forEach((id) => {
      toDelete.push(id)
    })
    delete newTree.children[idToDelete]
    delete newTree.heap[idToDelete]
    delete newTree.index[idToDelete]
  }
  return newTree
}

export const moveNode = (tree, nodeId, newParent) => {
  // Con't move root of tree
  if (nodeId === null) return tree
  // Can't move non-existant node
  if (tree.index[nodeId] === undefined && nodeId !== null) return tree
  // Can't move to non-existant parent
  if (tree.index[newParent] === undefined && newParent !== null) return tree
  // Can't move to same spot
  if (nodeId === newParent) return tree

  const { index, heap, children } = tree

  const oldParentId = heap[nodeId]
  if (newParent === oldParentId) return tree

  return {
    index,
    heap: {
      ...heap,
      [nodeId]: newParent,
    },
    children: {
      ...children,
      [newParent]: [...children[newParent], nodeId],
      [oldParentId]: [...children[oldParentId]].filter((x) => x !== nodeId),
    },
  }
}

export const nextId = (idProp) => ({ index }) => {
  return (
    Object.values(index)
      .map((x) => x[idProp])
      .reduce((maxId, id) => Math.max(id, maxId), 0) + 1
  )
}

export const newTree = (idProp, ...rootEntities) => {
  const tree = {
    children: {
      null: rootEntities.map((x) => x[idProp]),
      // Children to be added...
    },
    heap: {
      // Parents to be added
    },
    index: {
      // Items to be added
    },
  }

  rootEntities.forEach((entity) => {
    const entityId = entity[idProp]
    tree.children[entityId] = []
    tree.heap[entityId] = null
    tree.index[entityId] = entity
  })

  return tree
}

export const editNode = (tree, nodeId, newAttributes) => {
  if (!nodeId || !tree.index[nodeId]) return tree

  const { index, children, heap } = tree

  return {
    children,
    heap,
    index: {
      ...index,
      [nodeId]: {
        ...index[nodeId],
        ...newAttributes,
      },
    },
  }
}

export const filter = (tree, f) => {
  return Object.keys(tree.index).reduce((acc, nodeId) => {
    // We could have filtered this child already...
    if (!findNode(acc, nodeId)) return acc
    if (f(findNode(acc, nodeId))) {
      return acc
    } else {
      return deleteNode(acc, parseInt(nodeId))
    }
  }, tree)
}

export const reduce = (idProp) => (tree, f, initialValue) => {

}
