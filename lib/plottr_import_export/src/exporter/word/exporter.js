import { Document, Packer, Paragraph, AlignmentType, HeadingLevel } from 'docx'
import fs from 'fs'

import { t as t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import exportOutline from './exporters/outline'
import exportCharacters from './exporters/characters'
import exportPlaces from './exporters/places'
import exportNotes from './exporters/notes'
import convertImages from './exporters/convertImages'

const {
  books: { isSeries },
} = helpers

export default function Exporter(
  rawData,
  fileName,
  options,
  notifyUser,
  userId,
  downloadStorageImage
) {
  return convertImages(rawData, userId, downloadStorageImage).then((data) => {
    const names = namesMapping(data)
    const bookId = data.ui.currentTimeline

    const titlePageSections = options.general.titlePage ? seriesNameSection(data, bookId) : []
    const outlineSections = options.outline.export ? exportOutline(data, names, options) : []
    const charactersSections = options.characters.export ? exportCharacters(data, options) : []
    const placesSections = options.places.export ? exportPlaces(data, options) : []
    const notesSections = options.notes.export ? exportNotes(data, names, options) : []

    const doc = new Document({
      sections: [
        ...titlePageSections,
        ...outlineSections,
        ...charactersSections,
        ...placesSections,
        ...notesSections,
      ],
    })

    // finish - save to file
    return Packer.toBuffer(doc).then((buffer) => {
      const filePath = fileName.includes('.docx') ? fileName : `${fileName}.docx`
      fs.writeFileSync(filePath, buffer)

      notifyUser(filePath, 'word')

      return filePath
    })
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
    ? data.series.name + ' ' + t('(Series View)')
    : data.books[`${bookId}`].title
  const paragraph = new Paragraph({
    text: titleText,
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
  })
  return [{ children: [paragraph] }]
}
