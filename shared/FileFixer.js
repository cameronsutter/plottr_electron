const { cloneDeep } = require('lodash')

// fix chapter ids
function fix (data) {
  const obj = cloneDeep(data)

  // TODO: save a backup first



  // TODO: this needs to take into account lineIds
  // that's the key to pinning down where the card is from

  // ----------- scratch that above --------
  // lineIds may need to change too!





  const oldToNewIds = {}
  const chapterToBookMapping = {}
  obj.chapters = obj.chapters.map((ch, idx) => {
    const newId = idx + 1
    // save old chapter id => new chapter id by bookId
    if (oldToNewIds[ch.bookId]) {
      oldToNewIds[ch.bookId][ch.id] = newId
    } else {
      oldToNewIds[ch.bookId] = {[ch.id]: newId}
    }

    // save book id by chapter id
    chapterToBookMapping[ch.id] = ch.bookId

    // change id
    ch.id = newId
    return ch
  })

  obj.cards = obj.cards.map(c => {
    if (c.chapterId) {
      const bookId = chapterToBookMapping[ch.id]
      c.chapterId = oldToNewIds[bookId][c.chapterId]
    }
    return c
  })

  return obj
}

module.exports = fix