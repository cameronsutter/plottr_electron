import rtf from 'jsrtf'
import i18n from 'format-message'

const space = 100

const styleH1 = new rtf.Format({ bold : true, paragraph: true, spaceBefore : space, spaceAfter : space, fontSize: 18, alignCenter: true })
const styleH2 = new rtf.Format({ bold : true, paragraph: true, spaceBefore : space, spaceAfter : space, fontSize: 16, alignCenter: true })
const styleBold = new rtf.Format({ bold : true })
const styleItalic = new rtf.Format({ italic : true })
const styleUnderline = new rtf.Format({ underline : true })
const styleParagraph = new rtf.Format({ paragraph : true, spaceBefore : space, spaceAfter : space })

// useful functions
// doc.addTab
// doc.addLine

export default function serialize (nodes, doc) {
  if (!nodes) return doc
  if (typeof nodes === 'string') return doc.writeText(nodes)

  return nodes.flatMap(n => {
    if (!n.children) return leaf(n, doc)

    switch (n.type) {
      case 'numbered-list':
      case 'bulleted-list':
        doc.addLine()
        return makeList(n, doc)
      case 'heading-one':
        return doc.addElement([
          n.children.map(leafInElement)
        ], styleH1)
      case 'heading-two':
        return doc.addElement([
          n.children.map(leafInElement)
        ], styleH2)
      case 'list-item':
        // shouldn't get here because we handle the numbered-list and bulleted-list above
      case 'link':
        return doc.writeText(n.url)
      case 'image-link':
        return doc.writeText(n.url, styleParagraph)
      case 'image-data':
        return doc.writeText(i18n('[image]'), styleParagraph) // TODO: print the name of the image file too
      case 'block-quote':
        return doc.writeText(n.children[0].text, styleParagraph)
      case 'paragraph':
      default:
        return doc.addElement([
          n.children.map(leafInElement)
        ], styleParagraph)
    }
  })
}

const leaf = (node, doc) => {
  if (node.bold) {
    return doc.writeText(node.text, styleBold)
  }

  if (node.italic) {
    return doc.writeText(node.text, styleItalic)
  }

  if (node.underline) {
    return doc.writeText(node.text, styleUnderline)
  }

  return doc.writeText(node.text)
}

const leafInElement = (node) => {
  if (node.bold) {
    return new rtf.TextElement(node.text, styleBold)
  }

  if (node.italic) {
    return new rtf.TextElement(node.text, styleItalic)
  }

  if (node.underline) {
    return new rtf.TextElement(node.text, styleUnderline)
  }

  return new rtf.TextElement(node.text)
}

const makeList = (node, doc) => {
  const items = node.children.map(makeListItem).join(' ')

  const prefix = "\\ls1\\ilvl0\\cf2 \\kerning1\\expnd0\\expndtw0 \\outl0\\strokewidth0 "

  const list = rtf.Utils.makeRtfCmd(prefix, items, '', false)
  doc.addCommand(list)
}

const makeListItem = (node) => {
  const text = node.children.flatMap(ch => ch.text).join(' ')
  return rtf.Utils.makeRtfCmd("{\\listtext	\\uc0\\u8226	}", text, "\\\n", false)
}