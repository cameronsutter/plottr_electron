import i18n from 'format-message'
import { Paragraph, AlignmentType, HeadingLevel, Media } from 'docx'
import serialize from '../../../slate_serializers/to_word'
import exportCustomAttributes from './customAttributes'

export default function exportPlaces(state, doc) {
  let children = [
    new Paragraph({ text: '', pageBreakBefore: true }),
    new Paragraph({
      text: i18n('Places'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
  ]

  const paragraphs = places(state.places, state.customAttributes['places'], state.images, doc)

  return { children: children.concat(paragraphs) }
}

function places(places, customAttributes, images, doc) {
  let paragraphs = []
  places.forEach((pl) => {
    paragraphs.push(new Paragraph(''))
    let name = new Paragraph({ text: pl.name, heading: HeadingLevel.HEADING_2 })
    paragraphs.push(name)
    if (pl.imageId) {
      const imgData = images[pl.imageId] && images[pl.imageId].data
      if (imgData) {
        const image = Media.addImage(
          doc,
          Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), 'base64')
        )
        paragraphs.push(new Paragraph({ children: [image] }))
      }
    }
    paragraphs.push(new Paragraph({ text: i18n('Description'), heading: HeadingLevel.HEADING_3 }))
    paragraphs.push(new Paragraph(pl.description))
    paragraphs.push(new Paragraph({ text: i18n('Notes'), heading: HeadingLevel.HEADING_3 }))
    paragraphs = [
      ...paragraphs,
      ...serialize(pl.notes, doc),
      ...exportCustomAttributes(pl, customAttributes, HeadingLevel.HEADING_3, doc),
    ]
  })

  return paragraphs
}
