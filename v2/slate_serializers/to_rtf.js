/*
 * Some documentation on RTF documents can be found here:
 * https://www.oreilly.com/library/view/rtf-pocket-guide/9781449302047/ch01.html
 */

import rtf from 'jsrtf'
import { t as i18n } from 'plottr_locales'

const space = 100

const styleH1 = new rtf.Format({
  bold: true,
  paragraph: true,
  spaceBefore: space,
  spaceAfter: space,
  fontSize: 18,
  alignCenter: true,
})
const styleH2 = new rtf.Format({
  bold: true,
  paragraph: true,
  spaceBefore: space,
  spaceAfter: space,
  fontSize: 16,
  alignCenter: true,
})
const styleBold = new rtf.Format({ bold: true })
const styleItalic = new rtf.Format({ italic: true })
const styleUnderline = new rtf.Format({ underline: true })
const styleStrike = new rtf.Format({ strike: true })
const styleParagraph = new rtf.Format({ paragraph: true, spaceBefore: space, spaceAfter: space })

// useful functions
// doc.addTab
// doc.addLine

export default function serialize(nodes, doc) {
  if (!nodes) return doc
  if (typeof nodes === 'string') return doc.writeText(nodes)

  return nodes.flatMap((n) => {
    if (!n.children) return leaf(n, doc)

    switch (n.type) {
      case 'numbered-list':
      case 'bulleted-list':
        doc.addLine()
        return makeList(n, doc)
      case 'heading-one':
      case 'heading-two': {
        const headingStyle = n.type === 'heading-one' ? styleH1 : styleH2
        return n.children.map((child) => {
          if (child.text != null) {
            return doc.addElement([leafInElement(child)], headingStyle)
          } else {
            return child.children.map((text) => {
              return doc.addElement([leafInElement(text)], headingStyle)
            })
          }
        })
      }
      case 'list-item': // shouldn't get here because we handle the numbered-list and bulleted-list above
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
        return doc.addElement([n.children.map(leafInElement)], styleParagraph)
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

  if (node.strike) {
    return doc.writeText(node.text, styleStrike)
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
  const items = node.children.map(makeListItem).join('\n')
  doc.addCommand(items)
}

// There seems to be one thing about these lists that is weird
// The first list item has some extra spacing between the left margin
// and the bullet point. The rest of the items do not have this and I
// can't figure out why it is there. (Matt)
const makeListItem = (node) => {
  const text = node.children.flatMap((ch) => ch.text).join(' ')
  return `{\\pard\\fi-300\\li100\\bullet\\tab ${text} \\par}`
}
