const { shell, Notification } = require('electron')
const { Document, Packer, Paragraph, Media, AlignmentType, HeadingLevel } = require('docx')
const fs = require('fs')
const { sortBy, groupBy } = require('lodash')
const i18n = require('format-message')
const serialize = require('./slate_serializers/to_word')

function Exporter (data, { fileName, bookId }) {
  let doc = new Document()
  let names = namesMapping(data)
  let sections = []
  sections.push(seriesNameSection(data, bookId))
  sections.push(outlineSection(data, names, bookId, doc))
  sections.push(charactersSection(data, doc))
  sections.push(placesSection(data, doc))
  sections.push(notesSection(data, names, doc))

  sections.forEach(s => doc.addSection(s))

  // finish - save to file
  Packer.toBuffer(doc).then((buffer) => {
    const fullName = fileName.includes('.docx') ? fileName : `${fileName}.docx`
    fs.writeFileSync(fullName, buffer)
    if (Notification.isSupported()) {
      const notify = new Notification({
        title: i18n('File Exported'),
        body: i18n('Your Plottr file was exported to a .docx file'),
        silent: true,
      })
      notify.show()
    }
    shell.showItemInFolder(fullName)
  })
}

////////////////////////////////////
/////   Support Functions   ////////
////////////////////////////////////

function namesMapping (data) {
  let characterNames = data.characters.reduce(function(mapping, char){
    mapping[char.id] = char.name
    return mapping
  }, {})
  let placeNames = data.places.reduce(function(mapping, place){
    mapping[place.id] = place.name
    return mapping
  }, {})
  let tagTitles = data.tags.reduce(function(mapping, tag){
    mapping[tag.id] = tag.title
    return mapping
  }, {})

  return {
    characters: characterNames,
    places: placeNames,
    tags: tagTitles,
  }
}

function seriesNameSection (data, bookId) {
  let titleText = bookId == 'series' ? data.series.name : data.books[bookId].title
  const paragraph = new Paragraph({text: titleText, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER})
  return {children: [paragraph]}
}

function outlineSection (data, namesMapping, bookId, doc) {
  let children = []

  children.push(new Paragraph({text: i18n('Outline'), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER}))

  let chapters = []
  if (bookId == 'series') {
    chapters = sortBy(data.beats, 'position')
  } else {
    chapters = sortBy(data.chapters.filter(ch => ch.bookId == bookId), 'position')
  }
  if (!chapters.length) return {children: children}

  const offset = positionOffset(chapters)
  const paragraphs = chapters.flatMap(ch => chapterParagraphs(ch, data, namesMapping, bookId, offset, doc))

  return {children: children.concat(paragraphs)}
}

function chapterParagraphs (chapter, data, namesMapping, bookId, offset, doc) {
  const isSeries = bookId == 'series'
  let paragraphs = [new Paragraph('')]
  paragraphs.push(new Paragraph('^'))
  let title = chapterTitle(chapter, offset, isSeries)
  paragraphs.push(new Paragraph({text: title, heading: HeadingLevel.HEADING_2}))
  let lines = data.lines
  if (isSeries) {
    lines = data.seriesLines
  }
  cards = sortedChapterCards(chapter.autoOutlineSort, chapter.id, data.cards, lines, isSeries)
  console.log('sortedChapterCards', cards)
  let cardParagraphs = cards.flatMap(c => card(c, lines, namesMapping, doc, isSeries))
  return paragraphs.concat(cardParagraphs)
}

// TODO: most of this is copy/pasted from helpers/chapters
// when we refactor main.js, this can be shared from there
function positionOffset (sortedChapters) {
  return sortedChapters[0].title == i18n('Prologue') ? -1 : 0
}

// TODO: most of this is copy/pasted from helpers/chapters
// when we refactor main.js, this can be shared from there
function chapterTitle (chapter, offset, isSeries) {
  if (isSeries) {
    // if isSeries, chapters will actually be beats
    return chapter.title == 'auto' ? i18n('Beat {number}', {number: chapter.position + offset + 1}) : chapter.title
  } else {
    return chapter.title == 'auto' ? i18n('Chapter {number}', {number: chapter.position + offset + 1}) : chapter.title
  }
}

function card (card, lines, namesMapping, doc, isSeries) {
  let paragraphs = [new Paragraph('')]
  const idAttr = isSeries ? 'seriesLineId' : 'lineId'
  let line = lines.find(l => card[idAttr] == l.id)
  let titleString = card.title
  if (line) {
    titleString = `${card.title} (${line.title})`
  }
  let attachmentParagraphs = attachments(card, namesMapping)
  paragraphs.push(new Paragraph({text: titleString, heading: HeadingLevel.HEADING_3}))
  paragraphs = paragraphs.concat(attachmentParagraphs)
  const descParagraphs = serialize(card.description, doc)
  return paragraphs.concat(descParagraphs)
}

function attachments (obj, namesMapping) {
  let paragraphs = []
  let characters = []
  let places = []
  let tags = []

  if (obj.characters) characters = obj.characters.map(ch => namesMapping.characters[ch])
  if (obj.places) places = obj.places.map(pl => namesMapping.places[pl])
  if (obj.tags) tags = obj.tags.map(tg => namesMapping.tags[tg])

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

// TODO: most of this is copy/pasted from helpers/cards
// when we refactor main.js, this can be shared from there
function sortedChapterCards (autoSort, chapterId, allCards, allLines, isSeries) {
  let cards = findChapterCards(chapterId, allCards, isSeries)
  const sortedLines = sortBy(allLines, 'position')
  if (autoSort) {
    const idAttr = isSeries ? 'seriesLineId' : 'lineId'
    // group by position within the line
    // for each position, sort those cards by the order of the lines
    const groupedCards = groupBy(cards, 'positionWithinLine')
    const sortedLineIds = sortedLines.map(l => l.id)
    return Object.keys(groupedCards).flatMap(position => {
      return groupedCards[position].sort((a, b) => sortedLineIds.indexOf(a[idAttr]) - sortedLineIds.indexOf(b[idAttr]))
    })
  } else {
    return sortBy(cards, 'positionInChapter')
  }
}

function findChapterCards (chapterId, allCards, isSeries) {
  const idAttr = isSeries ? 'beatId' : 'chapterId'
  return allCards.filter(c => c[idAttr] === chapterId)
}

function charactersSection (data, doc) {
  let children = [
    new Paragraph({text: '', pageBreakBefore: true}),
    new Paragraph('^'),
    new Paragraph({text: i18n('Characters'), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER})
  ]

  const paragraphs = characters(data.characters, data.customAttributes['characters'], data.images, doc)

  return {children: children.concat(paragraphs)}
}

function characters (characters, customAttributes, images, doc) {
  let paragraphs = []
  characters.forEach(ch => {
    paragraphs.push(new Paragraph(''))
    paragraphs.push(new Paragraph('^'))
    let name = new Paragraph({text: ch.name, heading: HeadingLevel.HEADING_2})
    paragraphs.push(name)
    if (ch.imageId) {
      const imgData = images[ch.imageId] && images[ch.imageId].data
      if (imgData) {
        const image = Media.addImage(doc, Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), "base64"))
        paragraphs.push(new Paragraph({children: [image]}))
      }
    }
    paragraphs.push(new Paragraph({text: i18n('Description'), heading: HeadingLevel.HEADING_3}))
    paragraphs.push(new Paragraph(ch.description))
    paragraphs.push(new Paragraph({text: i18n('Notes'), heading: HeadingLevel.HEADING_3}))
    const descParagraphs = serialize(ch.notes, doc)
    paragraphs = [...paragraphs, ...descParagraphs]

    customAttributes.forEach(ca => {
      paragraphs.push(new Paragraph({text: ca.name, heading: HeadingLevel.HEADING_3}))
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

    ch.templates.forEach(t => {
      t.attributes.forEach(attr => {
        paragraphs.push(new Paragraph({text: attr.name, heading: HeadingLevel.HEADING_3}))
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

function placesSection (data, doc) {
  let children = [
    new Paragraph({text: '', pageBreakBefore: true}),
    new Paragraph('^'),
    new Paragraph({text: i18n('Places'), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER})
  ]

  const paragraphs = places(data.places, data.customAttributes['places'], data.images, doc)

  return {children: children.concat(paragraphs)}
}

function places (places, customAttributes, images, doc) {
  let paragraphs = []
  places.forEach(pl => {
    paragraphs.push(new Paragraph(''))
    paragraphs.push(new Paragraph('^'))
    let name = new Paragraph({text: pl.name, heading: HeadingLevel.HEADING_2})
    paragraphs.push(name)
    if (pl.imageId) {
      const imgData = images[pl.imageId] && images[pl.imageId].data
      if (imgData) {
        const image = Media.addImage(doc, Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), "base64"))
        paragraphs.push(new Paragraph({children: [image]}))
      }
    }
    paragraphs.push(new Paragraph({text: i18n('Description'), heading: HeadingLevel.HEADING_3}))
    paragraphs.push(new Paragraph(pl.description))
    paragraphs.push(new Paragraph({text: i18n('Notes'), heading: HeadingLevel.HEADING_3}))
    const descParagraphs = serialize(pl.notes, doc)
    paragraphs = [...paragraphs, ...descParagraphs]

    customAttributes.forEach(ca => {
      paragraphs.push(new Paragraph({text: ca.name, heading: HeadingLevel.HEADING_3}))
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

function notesSection (data, namesMapping, doc) {
  let children = [
    new Paragraph({text: '', pageBreakBefore: true}),
    new Paragraph('^'),
    new Paragraph({text: i18n('Notes'), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER})
  ]

  const paragraphs = notes(data.notes, namesMapping, data.images, doc)

  return {children: children.concat(paragraphs)}
}

function notes (notes, namesMapping, images, doc) {
  let paragraphs = []
  notes.forEach(function(n) {
    paragraphs.push(new Paragraph(''))
    paragraphs.push(new Paragraph('^'))
    let title = new Paragraph({text: n.title, heading: HeadingLevel.HEADING_2})
    paragraphs.push(title)
    if (n.imageId) {
      const imgData = images[n.imageId] && images[n.imageId].data
      if (imgData) {
        const image = Media.addImage(doc, Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), "base64"))
        paragraphs.push(new Paragraph({children: [image]}))
      }
    }
    const attachmentParagraphs = attachments(n, namesMapping)
    const contentParagraphs = serialize(n.content, doc)
    paragraphs = [...paragraphs, ...attachmentParagraphs, ...contentParagraphs]
  })

  return paragraphs
}

module.exports = Exporter
