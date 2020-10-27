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

  //   // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry)
  }

  return editor
}

export default withNormalizer