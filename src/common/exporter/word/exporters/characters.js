import i18n from 'format-message'
import { Paragraph, AlignmentType, HeadingLevel, Media } from 'docx'
import serialize from '../../../slate_serializers/to_word'
import exportCustomAttributes from './customAttributes'
import exportItemTemplates from './itemTemplates'

export default function exportCharacters(state, doc) {
  let children = [
    new Paragraph({ text: '', pageBreakBefore: true }),
    new Paragraph({
      text: i18n('Characters'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
  ]

  const paragraphs = characters(
    state.characters,
    state.customAttributes['characters'],
    state.images,
    doc
  )

  return { children: children.concat(paragraphs) }
}

function characters(characters, customAttributes, images, doc) {
  let paragraphs = []
  characters.forEach((ch) => {
    paragraphs.push(new Paragraph(''))
    let name = new Paragraph({ text: ch.name, heading: HeadingLevel.HEADING_2 })
    paragraphs.push(name)
    if (ch.imageId) {
      const imgData = images[ch.imageId] && images[ch.imageId].data
      if (imgData) {
        const image = Media.addImage(
          doc,
          Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), 'base64')
        )
        paragraphs.push(new Paragraph({ children: [image] }))
      }
    }
    paragraphs.push(new Paragraph({ text: i18n('Description'), heading: HeadingLevel.HEADING_3 }))
    paragraphs.push(new Paragraph(ch.description))
    paragraphs.push(new Paragraph({ text: i18n('Notes'), heading: HeadingLevel.HEADING_3 }))
    paragraphs = [
      ...paragraphs,
      ...serialize(ch.notes, doc),
      ...exportCustomAttributes(ch, customAttributes, HeadingLevel.HEADING_3, doc),
      ...exportItemTemplates(ch, HeadingLevel.HEADING_3, doc),
    ]
  })

  return paragraphs
}
