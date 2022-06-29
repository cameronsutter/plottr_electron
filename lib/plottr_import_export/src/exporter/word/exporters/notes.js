import { t } from 'plottr_locales'
import { Paragraph, AlignmentType, HeadingLevel, ImageRun } from 'docx'
import { slate } from 'pltr/v2'
import exportItemAttachments from './itemAttachments'

const { serialize } = slate.word

export default function exportNotes(state, namesMapping, doc, options) {
  let children = [new Paragraph({ text: '', pageBreakBefore: true })]

  if (options.notes.heading) {
    children.push(
      new Paragraph({
        text: t('Notes'),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  const paragraphs = notes(state.notes, namesMapping, state.images, doc, options)

  return { children: children.concat(paragraphs) }
}

function notes(notes, namesMapping, images, doc, options) {
  let paragraphs = []
  notes.forEach(function (n) {
    paragraphs.push(new Paragraph(''))
    paragraphs.push(new Paragraph({ text: n.title, heading: HeadingLevel.HEADING_2 }))
    if (options.notes.images && n.imageId) {
      const imgData = images[n.imageId] && images[n.imageId].data
      if (imgData) {
        paragraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: Uint8Array.from(atob(imgData.replace('data:image/webp;base64,', '')), (c) =>
                  c.charCodeAt(0)
                ),
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
    if (options.notes.attachments) {
      paragraphs = [...paragraphs, ...exportItemAttachments(n, namesMapping)]
    }
    if (options.notes.content) {
      paragraphs = [...paragraphs, ...serialize(n.content, doc)]
    }
  })

  return paragraphs
}
