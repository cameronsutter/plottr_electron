import { Document, Packer, Paragraph, AlignmentType, HeadingLevel } from 'docx'
import fs from 'fs'
import i18n from 'format-message'
import { notifyUser } from '../notifier'
import { helpers } from 'pltr/v2'
import exportOutline from './exporters/outline'
import exportCharacters from './exporters/characters'
import exportPlaces from './exporters/places'
import exportNotes from './exporters/notes'

const {
  books: { isSeries },
} = helpers

export default function Exporter(data, { fileName, bookId }) {
  let doc = new Document()
  let names = namesMapping(data)
  if (!bookId) bookId = data.ui.currentTimeline

  doc.addSection(seriesNameSection(data, bookId))
  doc.addSection(exportOutline(data, names, doc))
  doc.addSection(exportCharacters(data, doc))
  doc.addSection(exportPlaces(data, doc))
  doc.addSection(exportNotes(data, names, doc))

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
