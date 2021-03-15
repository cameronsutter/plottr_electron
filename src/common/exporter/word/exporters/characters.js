import i18n from 'format-message'
import { Paragraph, AlignmentType, HeadingLevel, Media } from 'docx'
import serialize from '../../../slate_serializers/to_word'
import exportCustomAttributes from './customAttributes'
import exportItemTemplates from './itemTemplates'

export default function exportCharacters(state, doc, options) {
  let children = [new Paragraph({ text: '', pageBreakBefore: true })]

  if (options.characters.heading) {
    children.push(
      new Paragraph({
        text: i18n('Characters'),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  const paragraphs = characters(
    state.characters,
    state.customAttributes['characters'],
    state.images,
    doc,
    options
  )

  return { children: children.concat(paragraphs) }
}

function characters(characters, customAttributes, images, doc, options) {
  let paragraphs = []
  characters.forEach((ch) => {
    paragraphs.push(new Paragraph(''))
    paragraphs.push(new Paragraph({ text: ch.name, heading: HeadingLevel.HEADING_2 }))
    if (options.characters.images && ch.imageId) {
      const imgData = images[ch.imageId] && images[ch.imageId].data
      if (imgData) {
        const image = Media.addImage(
          doc,
          Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), 'base64')
        )
        paragraphs.push(new Paragraph({ children: [image] }))
      }
    }
    if (options.characters.descriptionHeading) {
      paragraphs.push(new Paragraph({ text: i18n('Description'), heading: HeadingLevel.HEADING_3 }))
    }
    if (options.characters.description) {
      paragraphs.push(new Paragraph(ch.description))
    }
    if (options.characters.notesHeading) {
      paragraphs.push(new Paragraph({ text: i18n('Notes'), heading: HeadingLevel.HEADING_3 }))
    }
    if (options.characters.notes) {
      paragraphs = [...paragraphs, ...serialize(ch.notes, doc)]
    }
    if (options.characters.customAttributes) {
      paragraphs = [
        ...paragraphs,
        ...exportCustomAttributes(ch, customAttributes, HeadingLevel.HEADING_3, doc),
      ]
    }
    if (options.characters.templates) {
      paragraphs = [...paragraphs, ...exportItemTemplates(ch, HeadingLevel.HEADING_3, doc)]
    }
  })

  return paragraphs
}
