import { Node } from 'slate'

export const serialize = (nodes, isWindows) => {
  const joiner = isWindows ? '\r\n' : '\n'

  if (!nodes || !nodes.map) return ''
  if (typeof nodes === 'string') return isWindows ? nodes.replace(/\n/g, joiner) : nodes

  return nodes
    .map((n) => {
      const nodeString = Node.string(n)

      switch (n.type) {
        case 'numbered-list':
          return n.children.map((li) => `- ${Node.string(li)}`).join(joiner)
        case 'bulleted-list':
          return n.children.map((li, idx) => `${idx + 1}. ${Node.string(li)}`).join(joiner)
        case 'heading-one':
        case 'heading-two':
          return nodeString + joiner
        case 'link':
          return n.url
        case 'image-link':
          return n.url || nodeString
        case 'image-data':
        case 'list-item':
        case 'block-quote':
        case 'paragraph':
        default:
          return nodeString
      }
    })
    .join(joiner)
}
