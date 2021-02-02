import { keyBy } from 'lodash'
import i18n from 'format-message'
import { buildDescriptionFromObject, createFolderBinderItem, createTextBinderItem } from '../utils'
import { helpers, selectors } from 'pltr/v2'

const {
  sortedLinesByBookSelector,
  cardMapSelector,
  sortedChaptersByBookSelector,
  makeChapterTitleSelector,
  isSeriesSelector,
  scenesCustomAttributesSelector,
} = selectors
const {
  card: { sortCardsInChapter, cardMapping },
} = helpers

export default function exportChapters(state, documentContents) {
  // get current book id and select only those chapters/lines/cards
  const chapters = sortedChaptersByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const card2Dmap = cardMapSelector(state)
  const isSeries = isSeriesSelector(state)
  const chapterCardMapping = cardMapping(chapters, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')
  const customAttrs = scenesCustomAttributesSelector(state)

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

      let descObj = {
        description: c.description,
      }
      customAttrs.reduce((acc, entry) => {
        acc[entry.name] = c[entry.name]
        return acc
      }, descObj)

      documentContents[id] = {
        isNotesDoc: true,
        docTitle: i18n('Plotline: {title}', { title }),
        description: buildDescriptionFromObject(descObj),
      }
    })
    return binderItem
  })
}
