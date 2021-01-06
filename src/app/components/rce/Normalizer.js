import { Transforms, Element, Node } from 'slate'

const NO_PARAGRAPH_CHILDREN = ['paragraph', 'heading-one', 'heading-two']

const withNormalizer = editor => {
  const { normalizeNode } = editor

  editor.normalizeNode = entry => {
    const [node, path] = entry

    // If the element is a paragraph, ensure its children are not paragraphs
    if (Element.isElement(node) && NO_PARAGRAPH_CHILDREN.includes(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Element.isElement(child) && child.type == 'paragraph') {
          Transforms.unwrapNodes(editor, { at: childPath })
        }
      }
    }

    // TODO: Only allow text in headings (no other elements)

    // TODO: don't allow lists to have children that are not list-items


    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry)
  }

  return editor
}

export default withNormalizer
