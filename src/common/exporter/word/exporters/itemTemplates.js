import { Paragraph } from 'docx'
import serialize from '../../../slate_serializers/to_word'

export default function exportItemTemplates(item, headingLevel, doc) {
  return item.templates.flatMap((t) => {
    return t.attributes.flatMap((attr) => {
      let paragraphs = []
      if (!attr.value) return
      paragraphs.push(new Paragraph({ text: attr.name, heading: headingLevel }))
      if (attr.type == 'paragraph') {
        const attrParagraphs = serialize(attr.value, doc)
        paragraphs = [...paragraphs, ...attrParagraphs]
      } else {
        paragraphs.push(new Paragraph(attr.value))
      }
      return paragraphs
    })
  })
}
