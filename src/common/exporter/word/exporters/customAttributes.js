import { Paragraph } from 'docx'
import { slate } from 'pltr/v2'

const { serialize } = slate.word

export default function exportCustomAttributes(item, customAttrs, headingLevel, doc) {
  return customAttrs.flatMap((ca) => {
    let paragraphs = []
    if (item[ca.name]) {
      paragraphs.push(new Paragraph({ text: ca.name, heading: headingLevel }))
      if (ca.type == 'paragraph') {
        const attrParagraphs = serialize(item[ca.name], doc)
        paragraphs = [...paragraphs, ...attrParagraphs]
      } else {
        if (item[ca.name]) paragraphs.push(new Paragraph(item[ca.name]))
      }
    }
    return paragraphs
  })
}
