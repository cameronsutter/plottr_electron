import { Document, Packer, Paragraph, Media, AlignmentType, HeadingLevel } from 'docx'
import fs from 'fs'
import i18n from 'format-message'
import serialize from '../../slate_serializers/to_word'
import { notifyUser } from '../notifier'
import { helpers } from 'pltr/v2'
import exportOutline from './exporters/outline'

const {
  books: { isSeries },
} = helpers

export default function Exporter(data, { fileName, bookId }) {
  let doc = new Document()
  let names = namesMapping(data)
  let sections = []
  if (!bookId) bookId = data.ui.currentTimeline

  sections.push(seriesNameSection(data, bookId))
  sections.push(exportOutline(data, names, bookId, doc))
  sections.push(charactersSection(data, doc))
  sections.push(placesSection(data, doc))
  sections.push(notesSection(data, names, doc))

  sections.forEach((s) => doc.addSection(s))

  // finish - save to file
  Packer.toBuffer(doc).then((buffer) => {
    const filePath = fileName.includes('.docx') ? fileName : `${fileName}.docx`
    fs.writeFileSync(filePath, buffer)

    notifyUser(filePath, 'word')
  })
}

////////////////////////////////////
/////   Support Functions   ////////
////////////////////////////////////

function namesMapping(data) {
  let characterNames = data.characters.reduce(function (mapping, char) {
    mapping[char.id] = char.name
    return mapping
  }, {})
  let placeNames = data.places.reduce(function (mapping, place) {
    mapping[place.id] = place.name
    return mapping
  }, {})
  let tagTitles = data.tags.reduce(function (mapping, tag) {
    mapping[tag.id] = tag.title
    return mapping
  }, {})

  return {
    characters: characterNames,
    places: placeNames,
    tags: tagTitles,
  }
}

function seriesNameSection(data, bookId) {
  let titleText = isSeries(bookId)
    ? data.series.name + ' ' + i18n('(Series View)')
    : data.books[`${bookId}`].title
  const paragraph = new Paragraph({
    text: titleText,
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
  })
  return { children: [paragraph] }
}

function charactersSection(data, doc) {
  let children = [
    new Paragraph({ text: '', pageBreakBefore: true }),
    new Paragraph({
      text: i18n('Characters'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
  ]

  const paragraphs = characters(
    data.characters,
    data.customAttributes['characters'],
    data.images,
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
    const descParagraphs = serialize(ch.notes, doc)
    paragraphs = [...paragraphs, ...descParagraphs]

    customAttributes.forEach((ca) => {
      paragraphs.push(new Paragraph({ text: ca.name, heading: HeadingLevel.HEADING_3 }))
      if (ch[ca.name]) {
        if (ca.type == 'paragraph') {
          const attrParagraphs = serialize(ch[ca.name], doc)
          paragraphs = [...paragraphs, ...attrParagraphs]
        } else {
          if (ch[ca.name]) paragraphs.push(new Paragraph(ch[ca.name]))
        }
      } else {
        paragraphs.push(new Paragraph(''))
      }
    })

    ch.templates.forEach((t) => {
      t.attributes.forEach((attr) => {
        paragraphs.push(new Paragraph({ text: attr.name, heading: HeadingLevel.HEADING_3 }))
        if (!attr.value) return
        if (attr.type == 'paragraph') {
          const attrParagraphs = serialize(attr.value, doc)
          paragraphs = [...paragraphs, ...attrParagraphs]
        } else {
          paragraphs.push(new Paragraph(attr.value))
        }
      })
    })
  })

  return paragraphs
}

function placesSection(data, doc) {
  let children = [
    new Paragraph({ text: '', pageBreakBefore: true }),
    new Paragraph({
      text: i18n('Places'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
  ]

  const paragraphs = places(data.places, data.customAttributes['places'], data.images, doc)

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
    const descParagraphs = serialize(pl.notes, doc)
    paragraphs = [...paragraphs, ...descParagraphs]

    customAttributes.forEach((ca) => {
      paragraphs.push(new Paragraph({ text: ca.name, heading: HeadingLevel.HEADING_3 }))
      if (pl[ca.name]) {
        if (ca.type == 'paragraph') {
          const attrParagraphs = serialize(pl[ca.name], doc)
          paragraphs = [...paragraphs, ...attrParagraphs]
        } else {
          if (pl[ca.name]) paragraphs.push(new Paragraph(pl[ca.name]))
        }
      } else {
        paragraphs.push(new Paragraph(''))
      }
    })
  })

  return paragraphs
}

function notesSection(data, namesMapping, doc) {
  let children = [
    new Paragraph({ text: '', pageBreakBefore: true }),
    new Paragraph({
      text: i18n('Notes'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
  ]

  const paragraphs = notes(data.notes, namesMapping, data.images, doc)

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
    const attachmentParagraphs = attachments(n, namesMapping)
    const contentParagraphs = serialize(n.content, doc)
    paragraphs = [...paragraphs, ...attachmentParagraphs, ...contentParagraphs]
  })

  return paragraphs
}

function attachments(obj, namesMapping) {
  let paragraphs = []
  let characters = []
  let places = []
  let tags = []

  if (obj.characters) characters = obj.characters.map((ch) => namesMapping.characters[ch])
  if (obj.places) places = obj.places.map((pl) => namesMapping.places[pl])
  if (obj.tags) tags = obj.tags.map((tg) => namesMapping.tags[tg])

  if (characters.length) {
    paragraphs.push(new Paragraph(`${i18n('Characters')}: ${characters.join(', ')}`))
  }
  if (places.length) {
    paragraphs.push(new Paragraph(`${i18n('Places')}: ${places.join(', ')}`))
  }
  if (tags.length) {
    paragraphs.push(new Paragraph(`${i18n('Tags')}: ${tags.join(', ')}`))
  }
  if (paragraphs.length) {
    paragraphs.push(new Paragraph(''))
  }
  return paragraphs
}
