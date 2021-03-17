import { Document, Packer, Paragraph, AlignmentType, HeadingLevel } from 'docx'
import fs from 'fs'
import { t as i18n } from 'plottr_locales'
import { notifyUser } from '../notifier'
import { helpers } from 'pltr/v2'
import exportOutline from './exporters/outline'
import exportCharacters from './exporters/characters'
import exportPlaces from './exporters/places'
import exportNotes from './exporters/notes'

const {
  books: { isSeries },
} = helpers

export default function Exporter(data, fileName, options) {
  let doc = new Document()
  const names = namesMapping(data)
  const bookId = data.ui.currentTimeline

  if (options.general.titlePage) doc.addSection(seriesNameSection(data, bookId))
  if (options.outline.export) doc.addSection(exportOutline(data, names, doc, options))
  if (options.characters.export) doc.addSection(exportCharacters(data, doc, options))
  if (options.places.export) doc.addSection(exportPlaces(data, doc, options))
  if (options.notes.export) doc.addSection(exportNotes(data, names, doc, options))

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
