import { Paragraph } from 'docx'

import { serialize } from './to_word'

export default function exportCustomAttributes(item, customAttrs, headingLevel) {
  return (customAttrs || []).flatMap((ca) => {
    let paragraphs = []
    if (item[ca.name]) {
      paragraphs.push(new Paragraph({ text: ca.name, heading: headingLevel }))
      if (ca.type == 'paragraph') {
        const attrParagraphs = serialize(item[ca.name])
        paragraphs = [...paragraphs, ...attrParagraphs]
      } else {
        if (item[ca.name]) paragraphs.push(new Paragraph({ text: item[ca.name] }))
      }
    }
    return paragraphs
  })
}
