const { Node } = require('slate')
const docx = require('docx')

const serialize = (nodes) => {
  return nodes.flatMap(n => {
    if (!n.children) return leaf(n)

    const children = serialize(n.children)

    switch (n.type) {
      case 'block-quote':
        return ''
      case 'bulleted-list':
        return ''
      case 'heading-one':
        return ''
      case 'heading-two':
        return ''
      case 'list-item':
        return ''
      case 'numbered-list':
        return ''
      case 'link':
        return ''
      case 'image-link':
        return ''
      case 'paragraph':
        // console.log('node', n, children)
        return new docx.Paragraph({children: children})
      default:
        return children.flatMap(leaf)
    }
  })
}

const leaf = (node) => {
  const options = {text: node.text}

  if (node.bold) {
    options.bold = true
  }

  if (node.italic) {
    options.italics = true
  }

  if (node.underline) {
    options.underline = {}
  }

  return new docx.TextRun(options)
}

module.exports = serialize