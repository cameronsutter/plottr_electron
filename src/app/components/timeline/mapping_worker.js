export default () => {
  self.addEventListener('message', e => {
      if (!e) return;
      const { cards, chapters, filter } = e.data

      const cardMapping = cards.reduce((acc, card) => {
        acc[`${card.lineId}-${card.chapterId}`] = card
        return acc
      }, {})

      const chapterMapping = chapters.reduce((acc, chapter) => {
        acc[chapter.position] = chapter.id
        return acc
      }, {})

      const chapterMapKeys = Object.keys(chapterMapping)

      let visibleCards = cards.reduce((acc, card) => {
        if (filter == null) {
          acc[card.id] = true
        } else {
          // TODO: there's got to be a better way to do this logic
          let notVisible = true
          if (card.tags) {
            card.tags.forEach((tId) => {
              if (filter.tag.includes(tId)) notVisible = false
            })
          }
          if (card.characters) {
            card.characters.forEach((cId) => {
              if (filter.character.includes(cId)) notVisible = false
            })
          }
          if (card.places) {
            card.places.forEach((pId) => {
              if (filter.place.includes(pId)) notVisible = false
            })
          }
          acc[card.id] = !notVisible
        }

        return acc
      }, {})

      postMessage({ cardMapping, chapterMapping, chapterMapKeys, visibleCards })
  })
}
