var docx = require('docx')
var _ = require('lodash')
var i18n = require('format-message')

function Exporter (data, { fileName }) {
  let doc = new docx.Document()
  let title = new docx.Paragraph(new docx.TextRun(data.storyName).smallCaps())
  title.title().center().pageBreak()
  doc.addParagraph(title)

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

  let outlineHeading = new docx.Paragraph(i18n('Outline'))
  outlineHeading.heading1().center()
  doc.addParagraph(outlineHeading)
  outline(data, characterNames, placeNames, tagTitles).forEach(function(par) {
    doc.addParagraph(par)
  })

  doc.addParagraph(new docx.Paragraph('').pageBreak())
  let charactersHeading = new docx.Paragraph(i18n('Characters'))
  charactersHeading.heading1().center()
  doc.addParagraph(charactersHeading)
  characters(data.characters, data.customAttributes['characters']).forEach(function(par) {
    doc.addParagraph(par)
  })

  doc.addParagraph(new docx.Paragraph('').pageBreak())
  let placesHeading = new docx.Paragraph(i18n('Places'))
  placesHeading.heading1().center()
  doc.addParagraph(placesHeading)
  places(data.places, data.customAttributes['places']).forEach(function(par) {
    doc.addParagraph(par)
  })

  doc.addParagraph(new docx.Paragraph('').pageBreak())
  let notesHeading = new docx.Paragraph(i18n('Notes'))
  notesHeading.heading1().center()
  doc.addParagraph(notesHeading)
  notes(data.notes, characterNames, placeNames, tagTitles).forEach(function(par) {
    doc.addParagraph(par)
  })

  // finish - save to file
  let exporter = new docx.LocalPacker(doc, styles())
  exporter.pack(fileName)
}

////////////////////////////////////
/////   Support Functions   ////////
////////////////////////////////////

function outline (data, characterNames, placeNames, tagTitles) {
  let scenes = _.sortBy(data.scenes, 'position')
  let paragraphs = scenes.map(function(s) { return scene(s, data, characterNames, placeNames, tagTitles) })
  return _.flatten(paragraphs)
}

function scene (scene, data, characterNames, placeNames, tagTitles) {
  let paragraphs = []
  paragraphs.push(new docx.Paragraph(scene.title).heading2())
  let cards = sortedSceneCards(scene.id, data.cards, data.lines)
  let cardParagraphs = cards.map(function(c) { return card(c, data.lines, characterNames, placeNames, tagTitles) })
  let flattened = _.flatten(cardParagraphs)
  return paragraphs.concat(flattened)
}

function card (card, lines, characterNames, placeNames, tagTitles) {
  let paragraphs = []
  let line = _.find(lines, {id: card.lineId})
  let titleString = `${card.title} (${line.title})`
  let attachmentParagraphs = attachments(card, characterNames, placeNames, tagTitles)
  paragraphs.push(new docx.Paragraph(titleString).heading3())
  paragraphs = paragraphs.concat(attachmentParagraphs)
  paragraphs.push(new docx.Paragraph(card.description).style('indented'))
  return paragraphs
}

function attachments (obj, characterNames, placeNames, tagTitles) {
  let characters = []
  if (obj.characters) characters = obj.characters.map(function(ch) { return characterNames[ch]})
  let places = []
  if (obj.places) places = obj.places.map(function(pl) { return placeNames[pl]})
  let tags = []
  if (obj.tags) tags = obj.tags.map(function(tg) { return tagTitles[tg]})
  let paragraphs = []
  if (characters.length > 0) {
    paragraphs.push(new docx.Paragraph(`${i18n(Characters)}: ${characters.join(', ')}`).style('attachments'))
  }
  if (places.length > 0) {
    paragraphs.push(new docx.Paragraph(`${i18n(Places)}: ${places.join(', ')}`).style('attachments'))
  }
  if (tags.length > 0) {
    paragraphs.push(new docx.Paragraph(`${i18n(Tags)}: ${tags.join(', ')}`).style('attachments'))
  }
  if (paragraphs.length > 0) {
    paragraphs.push(new docx.Paragraph('').style('attachments'))
  }
  return paragraphs
}

function sortedSceneCards (sceneId, allCards, allLines) {
  let cards = findSceneCards(sceneId, allCards)
  const lines = _.sortBy(allLines, 'position')
  var sorted = []
  lines.forEach(function(l) {
    var card = _.find(cards, {lineId: l.id})
    if (card) sorted.push(card)
  })
  return sorted
}

function findSceneCards (sceneId, allCards) {
  return allCards.filter(function(c) {
    return c.sceneId === sceneId
  })
}

function characters (characters, customAttributes) {
  let paragraphs = []
  characters.forEach(function(ch) {
    let name = new docx.Paragraph(ch.name).heading2()
    paragraphs.push(name)
    paragraphs.push(new docx.Paragraph(i18n('Description')).heading3())
    paragraphs.push(new docx.Paragraph(ch.description).style('indented'))
    paragraphs.push(new docx.Paragraph(i18n('Notes')).heading3())
    paragraphs.push(new docx.Paragraph(ch.notes).style('indented'))
    customAttributes.forEach(function(ca) {
      paragraphs.push(new docx.Paragraph(ca).heading3())
      paragraphs.push(new docx.Paragraph(ch[ca]).style('indented'))
    })
  })

  return paragraphs
}

function places (places, customAttributes) {
  let paragraphs = []
  places.forEach(function(pl) {
    let name = new docx.Paragraph(pl.name).heading2()
    paragraphs.push(name)
    paragraphs.push(new docx.Paragraph(i18n('Description')).heading3())
    paragraphs.push(new docx.Paragraph(pl.description).style('indented'))
    paragraphs.push(new docx.Paragraph(i18n('Notes')).heading3())
    paragraphs.push(new docx.Paragraph(pl.notes).style('indented'))
    customAttributes.forEach(function(ca) {
      paragraphs.push(new docx.Paragraph(ca).heading3())
      paragraphs.push(new docx.Paragraph(pl[ca]).style('indented'))
    })
  })

  return paragraphs
}

function notes (notes, characterNames, placeNames, tagTitles) {
  let paragraphs = []
  notes.forEach(function(n) {
    let title = new docx.Paragraph(n.title).heading2()
    paragraphs.push(title)
    let attachmentParagraphs = attachments(n, characterNames, placeNames, tagTitles)
    paragraphs = paragraphs.concat(attachmentParagraphs)
    paragraphs.push(new docx.Paragraph(n.content).style('indented'))
  })

  return paragraphs
}

//////////////////////////
//////   Styles   ////////
//////////////////////////

function styles () {
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
