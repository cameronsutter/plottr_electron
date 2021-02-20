/* Tree is (minimally):
 *  | Node id [Tree]
 *
 * Where id may take on any name for it's key, and each tree may have
 * additional properties.
 */

/* We have to traverse the whole tree to add a node.  This isn't
 * great.  I have some thoughts about requiring absolute x position to
 * make this into an interval search algorithm, but maintaining that
 * position isn't easy.
 *
 * If A null parentId is supplied then add node at the top level.
 */
export const addNode = (idPropName) => (tree, parentId, node) => {
  if (!tree) return node

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
