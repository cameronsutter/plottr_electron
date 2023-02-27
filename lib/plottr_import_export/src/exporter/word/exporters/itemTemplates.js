import { Paragraph } from 'docx'

import { serialize } from './to_word'

export default function exportItemTemplates(item, headingLevel) {
  return (item.templates || []).flatMap((t) => {
    return (t.attributes || []).flatMap((attr) => {
      const value =
        t?.values?.find(({ name }) => {
          return name === attr.name
        })?.value || attr.value
      let paragraphs = []
      if (!value) return []
      paragraphs.push(new Paragraph({ text: attr.name, heading: headingLevel }))
      if (Array.isArray(value)) {
        const attrParagraphs = serialize(value)
        paragraphs = [...paragraphs, ...attrParagraphs]
      } else {
        paragraphs.push(new Paragraph({ text: value }))
      }
      return paragraphs
    })
  })
}
