import { keyBy } from 'lodash'
import i18n from 'format-message'
import { sortedChaptersByBookSelector, makeChapterTitleSelector } from 'app/selectors/chapters'
import { cardMapSelector } from 'app/selectors/cards'
import { sortCardsInChapter, cardMapping } from 'app/helpers/cards'
import { isSeriesSelector } from 'app/selectors/ui'
import { sortedLinesByBookSelector } from 'app/selectors/lines'
import { createFolderBinderItem, createTextBinderItem } from '../utils'

export default function exportChapters(state, documentContents) {
  // get current book id and select only those chapters/lines/cards
  const chapters = sortedChaptersByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const card2Dmap = cardMapSelector(state)
  const isSeries = isSeriesSelector(state)
  const chapterCardMapping = cardMapping(chapters, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')

  // create a BinderItem for each chapter (Type: Folder)
  //   create a BinderItem for each card (Type: Text)

  return chapters.map((ch) => {
    const uniqueChapterTitleSelector = makeChapterTitleSelector(state)
    const title = uniqueChapterTitleSelector(state, ch.id)
    const { binderItem } = createFolderBinderItem(title)

    // sort cards into chapters by lines (like outline auto-sorting)
    const cards = chapterCardMapping[ch.id]
    const sortedCards = sortCardsInChapter(ch.autoOutlineSort, cards, lines, isSeries)
    sortedCards.forEach((c) => {
      const { id, binderItem: cardItem } = createTextBinderItem(c.title)
      binderItem['Children']['BinderItem'].push(cardItem)

      // save card info into documentContents
      let title = ''
      const lineId = isSeries ? c.seriesLineId : c.lineId
      const line = linesById[lineId]
      if (line) title = line.title

      documentContents[id] = {
        lineTitle: i18n('Plotline: {title}', { title }),
        description: c.description,
      }
    })
    return binderItem
  })
}
