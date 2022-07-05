import { Paragraph, TextRun, HeadingLevel, ImageRun, ExternalLink } from 'docx'
import tinycolor from 'tinycolor2'

/* NONE of this works
const numbering = new Numbering({
  config: [
    {
      reference: 'decimal-numbering',
      levels: [
        {
          level: 0,
          format: 'decimal',
          text: '%1',
          alignment: AlignmentType.START,
          style: {
            paragraph: {
              indent: { left: 720, hanging: 260 },
            },
          },
        },
      ],
    },
  ],
})

const abstractNum = numbering.createAbstractNumbering([
  {
    level: 0,
    format: 'decimal',
    text: '%1',
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

END NONE of this works */

export const serialize = (nodes) => {
  function iter(nodes) {
    if (!nodes || !nodes.flatMap) return []
    if (typeof nodes === 'string') return [new Paragraph({ children: [leaf({ text: nodes })] })]

    return nodes.flatMap((n) => {
      if (!n.children) return leaf(n)

      const children = iter(n.children)

      switch (n.type) {
        case 'list-item':
          return children[0] // always an array with 1 TextRun
        case 'numbered-list':
        // make it a bullet list for now
        // this isn't working for now
        // return children.map(li => new Paragraph({children: [li.root[1]], numbering: { reference: concrete, level: 0 }}))

        // eslint-disable-next-line no-fallthrough
        case 'bulleted-list':
          return (n.children || []).map((li) => {
            if (li.text !== undefined) {
              // we have a text child ... probably in a bad format
              return new Paragraph({ text: li.text })
            }
            return new Paragraph({
              children: (li.children || []).map(leaf),
              bullet: { level: 0 },
            })
          })
        // this isn't allowed in the UI anymore (2021.1.12) but it may still exist in the wild
        // return children.map((li) => {
        //   if (li instanceof Paragraph)
        //     return new Paragraph({ children: [li.root[1]], bullet: { level: 0 } })
        // })
        // }
        // Headings can sometimes have 1+ paragraph children, which the docx exporter does not allow
        // so we map over all the node's children (ignoring what we serialized above) and serialize
        // them again but as individual headings
        case 'heading-one':
        case 'heading-two': {
          const headingLevel =
            n.type === 'heading-one' ? HeadingLevel.HEADING_4 : HeadingLevel.HEADING_5
          return (n.children || []).map((child) => {
            if (child.text != null) {
              return new Paragraph({
                children: [leaf(child)],
                heading: headingLevel,
              })
            }

            if (child.type === 'paragraph') {
              return new Paragraph({
                children: (child.children || []).map(leaf),
                heading: headingLevel,
              })
            }
          })
        }
        case 'link':
          return new ExternalLink({
            children: [
              new TextRun({
                text: n.url,
                style: 'Hyperlink',
              }),
            ],
            link: n.url,
          })
        case 'image-link':
          return new Paragraph({
            children: [
              new ExternalLink({
                children: [
                  new TextRun({
                    text: n.url,
                    style: 'Hyperlink',
                  }),
                ],
                link: n.url,
              }),
              ...children,
            ],
          })
        case 'image-data': {
          const imgData = n.data
          return new Paragraph({
            children: [
              new ImageRun({
                data: imgData,
                transformation: {
                  width: 300,
                  height: 300,
                },
              }),
            ],
          })
        }
        case 'block-quote':
          return children
        case 'paragraph':
        default:
          if (Array.isArray(children)) {
            return new Paragraph({ children: children })
          }
      }
    })
  }
  return iter(nodes)
}

const leaf = (node) => {
  const options = { text: node.text }

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
    options.color = tinycolor(node.color).toHex()
  }

  if (node.strike) {
    options.strike = true
  }

  if (node.font) {
    options.font = { hint: node.font, name: node.font }
  }

  if (node.fontSize) {
    options.size = node.fontSize * 2
  }

  return new TextRun(options)
}