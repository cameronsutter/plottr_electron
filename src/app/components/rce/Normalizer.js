import { Transforms, Element, Node } from 'slate'
import { LIST_TYPES } from './helpers'

const withNormalizer = editor => {
  const { normalizeNode } = editor

  editor.normalizeNode = entry => {
    const [node, path] = entry

    // If the element is a paragraph, ensure its children are valid.
    if (Element.isElement(node) && node.type === 'paragraph') {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && !editor.isInline(child)) {
          Transforms.unwrapNodes(editor, { at: childPath })
          return
        }
      }
    }

    // If it's a list-item, make sure it has a bulleted-list or a numbered-list parent
    console.log('LIST ITEM?', node.type)
    if (Element.isElement(node) && node.type === 'list-item') {
      const parent = Node.parent(editor, path)
      if (Element.isElement(parent) && !LIST_TYPES.includes(parent.type)) {
        Transforms.wrapNodes(editor, { type: 'bulleted-list', children: [] })
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry)
  }

  return editor
}

export default withNormalizer