import { Paragraph } from 'docx'
import { slate } from 'pltr/v2'

const { serialize } = slate.word

export default function exportItemTemplates(item, headingLevel) {
  return (item.templates || []).flatMap((t) => {
    return (t.attributes || []).flatMap((attr) => {
      let paragraphs = []
      if (!attr.value) return []
      paragraphs.push(new Paragraph({ text: attr.name, heading: headingLevel }))
      if (attr.type == 'paragraph') {
        const attrParagraphs = serialize(attr.value)
        paragraphs = [...paragraphs, ...attrParagraphs]
      } else {
        paragraphs.push(new Paragraph(attr.value))
      }
      return paragraphs
    })
  })
}
