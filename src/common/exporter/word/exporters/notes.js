import i18n from 'format-message'
import { Paragraph, AlignmentType, HeadingLevel, Media } from 'docx'
import serialize from '../../../slate_serializers/to_word'
import exportItemAttachments from './itemAttachments'

export default function exportNotes(state, namesMapping, doc) {
  let children = [
    new Paragraph({ text: '', pageBreakBefore: true }),
    new Paragraph({
      text: i18n('Notes'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
  ]

  const paragraphs = notes(state.notes, namesMapping, state.images, doc)

  return { children: children.concat(paragraphs) }
}

function notes(notes, namesMapping, images, doc) {
  let paragraphs = []
  notes.forEach(function (n) {
    paragraphs.push(new Paragraph(''))
    let title = new Paragraph({ text: n.title, heading: HeadingLevel.HEADING_2 })
    paragraphs.push(title)
    if (n.imageId) {
      const imgData = images[n.imageId] && images[n.imageId].data
      if (imgData) {
        const image = Media.addImage(
          doc,
          Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), 'base64')
        )
        paragraphs.push(new Paragraph({ children: [image] }))
      }
    }
    const attachmentParagraphs = exportItemAttachments(n, namesMapping)
    const contentParagraphs = serialize(n.content, doc)
    paragraphs = [...paragraphs, ...attachmentParagraphs, ...contentParagraphs]
  })

  return paragraphs
}
