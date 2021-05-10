import { Editor, Transforms, Element, Node } from 'slate'
import { LIST_TYPES, HEADING_TYPES, createEditor } from './helpers'

const withNormalizer = (editor) => {
  const { normalizeNode } = editor

  editor.normalizeNode = (entry) => {
    const [node, path] = entry

    // Only allow text in headings (no other elements as children)
    if (Element.isElement(node) && HEADING_TYPES.includes(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type) {
          Transforms.unwrapNodes(editor, { at: childPath })
        }
      }
    }

    // If the element is a paragraph, ensure its children are not paragraphs
    if (Element.isElement(node) && node.type == 'paragraph') {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type == 'paragraph') {
          Transforms.unwrapNodes(editor, node, { at: childPath })
        }
      }
    }

    // Only allow list-items as children of lists
    if (Element.isElement(node) && LIST_TYPES.includes(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type != 'list-item') {
          Transforms.setNodes(editor, { type: 'list-item' }, { at: childPath })
        }
      }
    }

    // don't allow list-items to be children of other list-items
    if (Element.isElement(node) && node.type == 'list-item') {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type == 'list-item') {
          Transforms.liftNodes(editor, { at: childPath })
        }
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry)
  }

  return editor
}

export const normalize = (content) => {
  const editor = withNormalizer(createEditor())
  editor.children = content
  Editor.normalize(editor, { force: true })
  return editor.children
}

export default withNormalizer
