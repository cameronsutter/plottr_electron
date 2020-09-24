import { Transforms, Element, Node, Text } from 'slate'
import { LIST_TYPES } from './helpers'

const withNormalizer = editor => {
  const { normalizeNode } = editor

  editor.normalizeNode = entry => {
    const [node, path] = entry

    // If the element is a paragraph, ensure its children are not paragraphs
    if (Element.isElement(node) && node.type === 'paragraph') {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type == 'paragraph') {
          Transforms.unwrapNodes(editor, { at: childPath })
        }
      }
    }

    // we're at the root and it has list items
    // wrap them in a bulleted-list
    if (!Element.isElement(node) && !Text.isText(node)) {
      let childrenToFix = []
      let pathsToRemove = []
      let insertPath = null
      for (const [child, childPath] of Node.children(editor, path)) {
        if (child.type == 'list-item') {
          childrenToFix.push({...child})
          pathsToRemove.unshift([...childPath])
          insertPath = insertPath || [...childPath]
        }
      }
      if (childrenToFix.length) {
        pathsToRemove.forEach(p => Transforms.removeNodes(editor, { at: p }))
        Transforms.insertNodes(editor, { type: 'bulleted-list', children: childrenToFix }, { at: insertPath })
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry)
  }

  return editor
}

export default withNormalizer