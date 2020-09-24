const { Paragraph, TextRun, AlignmentType, HeadingLevel, Numbering, Hyperlink, HyperlinkType, HyperLinkRef, Media } = require('docx')

// NONE of this works
const numbering = new Numbering({config: [
  {
    reference: 'decimal-numbering',
    levels: [
      {
        level: 0,
        format: "decimal",
        text: "%1",
        alignment: AlignmentType.START,
        style: {
          paragraph: {
            indent: { left: 720, hanging: 260 },
          },
        },
      }
    ],
  },
]})

const abstractNum = numbering.createAbstractNumbering([
  {
    level: 0,
    format: "decimal",
    text: "%1",
    alignment: AlignmentType.START,
    style: {
      paragraph: {
        indent: { left: 720, hanging: 260 },
      },
    },
  },
])
// abstractNum.createLevel(0, "decimal", "%1.", "start").addParagraphProperty(new Indent(720, 260))
const concrete = numbering.createConcreteNumbering(abstractNum)

// END NONE of this works

const serialize = (nodes, doc) => {
  if (!nodes || !nodes.flatMap) return []
  if (typeof nodes === 'string') return [new Paragraph({children: [leaf({text: nodes})]})]

  return nodes.flatMap(n => {
    if (!n.children) return leaf(n)

    const children = serialize(n.children, doc)

    switch (n.type) {
      case 'bulleted-list':
        return children.map(li => new Paragraph({children: [li], bullet: {level: 0}}))
      case 'heading-one':
        return new Paragraph({children: children, heading: HeadingLevel.HEADING_4})
      case 'heading-two':
        return new Paragraph({children: children, heading: HeadingLevel.HEADING_5})
      case 'list-item':
        return children[0] // always an array with 1 TextRun
      case 'numbered-list':
        // make it a bullet list for now
        return children.map(li => new Paragraph({children: [li], bullet: {level: 0}}))
        // this isn't working for now
        // return children.map(li => new Paragraph({children: [li.root[1]], numbering: { reference: concrete, level: 0 }}))
      case 'link':
        return doc.createHyperlink(n.url, n.url)
      case 'image-link':
        return new Paragraph({children: [doc.createHyperlink(n.url, n.url), ...children]})
      case 'image-data':
        const imgData = n.data
        const image = Media.addImage(doc, Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), "base64"))
        return new Paragraph({children: [image]})
      case 'block-quote':
      case 'paragraph':
      default:
        return new Paragraph({children: children})
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

  if (node.color) {
    options.color = node.color.replace('#', '')
  }

  if (node.strike) {
    options.strike = true
  }

  if (node.font) {
    options.font = {hint: node.font, name: node.font}
  }

  return new TextRun(options)
}

module.exports = serialize