import { Paragraph } from 'docx'

import { serialize } from './to_word'

export default function exportItemTemplates(item, headingLevel) {
  return (item.templates || []).flatMap((t) => {
    return (t.attributes || []).flatMap((attr) => {
      const value = t.values.find(({ name }) => {
        return name === attr.name
      })
      let paragraphs = []
      if (!value || !value.value) return []
      paragraphs.push(new Paragraph({ text: attr.name, heading: headingLevel }))
      if (Array.isArray(value.value)) {
        const attrParagraphs = serialize(value.value)
        paragraphs = [...paragraphs, ...attrParagraphs]
      } else {
        paragraphs.push(new Paragraph({ text: value.value }))
      }
      return paragraphs
    })
  })
}
