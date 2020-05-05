const _ = require('lodash')
const convert = require('../../slate_serializers/from_html')

function migrate (data) {
  if (data.file && data.file.version === '2020.5.5') return data

  var obj = _.cloneDeep(data)

  // fix up characters
  // make sure noteIds & cards fields are not null
  obj.characters = data.characters.map(ch => {
    ch.noteIds = ch.noteIds || []
    ch.cards = ch.cards || []
    return ch
  })

  // fix up places
  // make sure noteIds & cards fields are not null
  obj.places = data.places.map(pl => {
    pl.noteIds = pl.noteIds || []
    pl.cards = pl.cards || []
    return pl
  })

  // only fix up ids if the file is in a bad state
  let uniqueIds = _.uniq(data.cards.map(c => c.id))
  let idFixup = uniqueIds.length != data.cards.length
  obj.cards = _.sortBy(data.cards, 'id').map((c, idx) => {
    // fix up card descriptions that are strings (imported from a template)
    if (!c.description || typeof c.description === 'string') {
      c.description = convert(c.description)
    }

    // fix up card ids (some are duplicates because of templates)
    if (idFixup) {
      c.id = idx + 1
    }
    return c
  })

  // fix up chapter ids (some are duplicates because of templates)
  // only if the file is in a bad state
  uniqueIds = _.uniq(data.chapters.map(c => c.id))
  idFixup = uniqueIds.length != data.chapters.length
  if (idFixup) {
    obj.chapters = _.sortBy(data.chapters, 'id').map((ch, idx) => {
      ch.id = idx + 1
      return ch
    })
  }

  return obj
}

module.exports = migrate
