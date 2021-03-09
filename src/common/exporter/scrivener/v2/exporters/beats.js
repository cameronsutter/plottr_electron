import { keyBy } from 'lodash'
import { t as i18n } from 'plottr_locales'
import { buildDescriptionFromObject, createFolderBinderItem, createTextBinderItem } from '../utils'
import { helpers, selectors } from 'pltr/v2'

const {
  sortedLinesByBookSelector,
  cardMapSelector,
  sortedBeatsByBookSelector,
  makeBeatTitleSelector,
  cardsCustomAttributesSelector,
} = selectors
const {
  card: { sortCardsInBeat, cardMapping },
} = helpers

export default function exportBeats(state, documentContents) {
  // get current book id and select only those beats/lines/cards
  const beats = sortedBeatsByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const card2Dmap = cardMapSelector(state)
  const beatCardMapping = cardMapping(beats, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')
  const customAttrs = cardsCustomAttributesSelector(state)

  // create a BinderItem for each beat (Type: Folder)
  //   create a BinderItem for each card (Type: Text)

  return beats.map((beat) => {
    const uniqueBeatTitleSelector = makeBeatTitleSelector(state)
    const title = uniqueBeatTitleSelector(state, beat.id)
    const { binderItem } = createFolderBinderItem(title)

    // sort cards into beats by lines (like outline auto-sorting)
    const cards = beatCardMapping[beat.id]
    const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)
    sortedCards.forEach((c) => {
      const { id, binderItem: cardItem } = createTextBinderItem(c.title)
      binderItem['Children']['BinderItem'].push(cardItem)

      // save card info into documentContents
      let title = ''
      const lineId = c.lineId
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
