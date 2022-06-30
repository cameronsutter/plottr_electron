import { t } from 'plottr_locales'
import { Paragraph, AlignmentType, HeadingLevel, ImageRun } from 'docx'
import { slate } from 'pltr/v2'
import exportCustomAttributes from './customAttributes'

const { serialize } = slate.word

export default function exportPlaces(state, options) {
  let children = [new Paragraph({ text: '', pageBreakBefore: true })]

  if (options.places.heading) {
    children.push(
      new Paragraph({
        text: t('Places'),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  const paragraphs = places(state.places, state.customAttributes['places'], state.images, options)

  return [{ children: children.concat(paragraphs) }]
}

function places(places, customAttributes, images, options) {
  let paragraphs = []
  places.forEach((pl) => {
    paragraphs.push(new Paragraph(''))
    paragraphs.push(new Paragraph({ text: pl.name, heading: HeadingLevel.HEADING_2 }))
    if (options.places.images && pl.imageId) {
      const imgData = images[pl.imageId] && images[pl.imageId].data
      if (imgData) {
        paragraphs.push(
          new Paragraph({
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
        )
      }
    }
    if (options.places.descriptionHeading) {
      paragraphs.push(new Paragraph({ text: t('Description'), heading: HeadingLevel.HEADING_3 }))
    }
    if (options.places.description) {
      paragraphs.push(new Paragraph(pl.description))
    }
    if (options.places.notesHeading) {
      paragraphs.push(new Paragraph({ text: t('Notes'), heading: HeadingLevel.HEADING_3 }))
    }
    if (options.places.notes) {
      paragraphs = [...paragraphs, ...serialize(pl.notes)]
    }
    if (options.places.customAttributes) {
      paragraphs = [
        ...paragraphs,
        ...exportCustomAttributes(pl, customAttributes, HeadingLevel.HEADING_3),
      ]
    }
  })

  return paragraphs
}
