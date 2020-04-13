const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = require('docx')
const fs = require('fs')
const _ = require('lodash')
const i18n = require('format-message')
const serialize = require('./slate_serializers/to_word')

function Exporter (data, { fileName, bookId }) {
  let doc = new Document()
  let names = namesMapping(data)
  let sections = []
  sections.push(seriesNameSection(data, bookId))
  sections.push(outlineSection(data, names, bookId))

  // doc.addParagraph(new Paragraph('').pageBreak())
  // doc.addParagraph(new Paragraph('^'))
  // let charactersHeading = new Paragraph(i18n('Characters'))
  // charactersHeading.heading1().center()
  // doc.addParagraph(charactersHeading)
  // characters(data.characters, data.customAttributes['characters']).forEach(function(par) {
  //   doc.addParagraph(par)
  // })

  // doc.addParagraph(new Paragraph('').pageBreak())
  // doc.addParagraph(new Paragraph('^'))
  // let placesHeading = new Paragraph(i18n('Places'))
  // placesHeading.heading1().center()
  // doc.addParagraph(placesHeading)
  // places(data.places, data.customAttributes['places']).forEach(function(par) {
  //   doc.addParagraph(par)
  // })

  // doc.addParagraph(new Paragraph('').pageBreak())
  // doc.addParagraph(new Paragraph('^'))
  // let notesHeading = new Paragraph(i18n('Notes'))
  // notesHeading.heading1().center()
  // doc.addParagraph(notesHeading)
  // notes(data.notes, characterNames, placeNames, tagTitles).forEach(function(par) {
  //   doc.addParagraph(par)
  // })

  sections.forEach(s => doc.addSection(s))

  // finish - save to file
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(`${fileName}.docx`, buffer)
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

function outlineSection (data, namesMapping, bookId) {
  let children = []

  children.push(new Paragraph({text: i18n('Outline'), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER}))

  // TODO: handle 'series' and undefined
  let chapters = _.sortBy(data.chapters.filter(ch => ch.bookId == bookId), 'position')
  let paragraphs = chapters.flatMap(ch => chapterParagraphs(ch, data, namesMapping))

  return {children: children.concat(paragraphs)}
}

function chapterParagraphs (chapter, data, namesMapping) {
  let paragraphs = []
  paragraphs.push(new Paragraph({text: '^', spacing: { before: 16}}))
  let title = chapter.title == 'auto' ? i18n('Chapter {number}', {number: chapter.position + 1}) : chapter.title
  paragraphs.push(new Paragraph({text: title, heading: HeadingLevel.HEADING_2}))
  const cards = sortedChapterCards(chapter.id, data.cards, data.lines)
  let cardParagraphs = cards.flatMap(c => card(c, data.lines, namesMapping))
  return paragraphs.concat(cardParagraphs)
}

function card (card, lines, namesMapping) {
  let paragraphs = []
  let line = _.find(lines, {id: card.lineId})
  let titleString = `${card.title} (${line.title})`
  let attachmentParagraphs = attachments(card, namesMapping)
  paragraphs.push(new Paragraph({text: titleString, heading: HeadingLevel.HEADING_3, spacing: { before: 16 }}))
  paragraphs = paragraphs.concat(attachmentParagraphs)
  const descParagraphs = serialize(card.description)
  // console.log(descParagraphs)
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

function sortedChapterCards (chapterId, allCards, allLines) {
  let cards = findChapterCards(chapterId, allCards)
  const lines = _.sortBy(allLines, 'position')
  var sorted = []
  lines.forEach(function(l) {
    var card = _.find(cards, {lineId: l.id})
    if (card) sorted.push(card)
  })
  return sorted
}

function findChapterCards (chapterId, allCards) {
  return allCards.filter(function(c) {
    return c.chapterId === chapterId
  })
}

function characters (characters, customAttributes) {
  // TODO: handle templates
  let paragraphs = []
  characters.forEach(function(ch) {
    let name = new Paragraph(ch.name).heading2()
    paragraphs.push(name)
    paragraphs.push(new Paragraph(i18n('Description')).heading3())
    paragraphs.push(new Paragraph(ch.description).style('indented'))
    paragraphs.push(new Paragraph(i18n('Notes')).heading3())
    paragraphs.push(new Paragraph(ch.notes).style('indented'))
    customAttributes.forEach(function(ca) {
      paragraphs.push(new Paragraph(ca).heading3())
      paragraphs.push(new Paragraph(ch[ca]).style('indented'))
    })
  })

  return paragraphs
}

function places (places, customAttributes) {
  let paragraphs = []
  places.forEach(function(pl) {
    let name = new Paragraph(pl.name).heading2()
    paragraphs.push(name)
    paragraphs.push(new Paragraph(i18n('Description')).heading3())
    paragraphs.push(new Paragraph(pl.description).style('indented'))
    paragraphs.push(new Paragraph(i18n('Notes')).heading3())
    paragraphs.push(new Paragraph(pl.notes).style('indented'))
    customAttributes.forEach(function(ca) {
      paragraphs.push(new Paragraph(ca).heading3())
      paragraphs.push(new Paragraph(pl[ca]).style('indented'))
    })
  })

  return paragraphs
}

function notes (notes, characterNames, placeNames, tagTitles) {
  let paragraphs = []
  notes.forEach(function(n) {
    let title = new Paragraph(n.title).heading2()
    paragraphs.push(title)
    let attachmentParagraphs = attachments(n, characterNames, placeNames, tagTitles)
    paragraphs = paragraphs.concat(attachmentParagraphs)
    paragraphs.push(new Paragraph(n.content).style('indented'))
  })

  return paragraphs
}

//////////////////////////
//////   Styles   ////////
//////////////////////////

function styles () {
  return [

  ]
  let paragraphStyles = new docx.Styles()
  paragraphStyles.createParagraphStyle('Normal', 'Normal')
    .quickFormat()
    .size(20)
    .spacing({before: 0, after: 240, line: 300})

  paragraphStyles.createParagraphStyle('Title', 'Title')
    .quickFormat()
    .basedOn('Normal')
    .next('Normal')
    .size(56)

  paragraphStyles.createParagraphStyle('Heading1', 'Heading 1')
    .quickFormat()
    .basedOn('Normal')
    .next('Normal')
    .size(32)
    .spacing({before: 0, after: 480})

  paragraphStyles.createParagraphStyle('Heading2', 'Heading 2')
    .quickFormat()
    .basedOn('Normal')
    .next('Normal')
    .size(28)  // 14pt font
    .spacing({before: 0, after: 240})  // TWIP for both

  paragraphStyles.createParagraphStyle('Heading3', 'Heading 3')
    .quickFormat()
    .basedOn('Normal')
    .next('Normal')
    .size(24)
    .spacing({before: 0, after: 120})
    .indent(360)

  paragraphStyles.createParagraphStyle('indented', 'Indented Normal')
    .basedOn('Normal')
    .next('Normal')
    .indent(720)

  paragraphStyles.createParagraphStyle('attachments', 'Attachments')
    .basedOn('Normal')
    .next('Normal')
    .spacing({before: 0, after: 0})
    .indent(720)

  return paragraphStyles
}

module.exports = Exporter
