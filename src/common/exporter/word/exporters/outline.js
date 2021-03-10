import { keyBy } from 'lodash'
import i18n from 'format-message'
import { helpers, selectors } from 'pltr/v2'
import { Paragraph, AlignmentType, HeadingLevel } from 'docx'
import serialize from '../../../slate_serializers/to_word'
import exportCustomAttributes from './customAttributes'
import exportItemTemplates from './itemTemplates'
import exportItemAttachments from './itemAttachments'

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

export default function exportOutline(state, namesMapping, doc) {
  // get current book id and select only those beats/lines/cards
  const beats = sortedBeatsByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const card2Dmap = cardMapSelector(state)
  const beatCardMapping = cardMapping(beats, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')

  let children = []

  children.push(
    new Paragraph({
      text: i18n('Outline'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  )

  if (!beats.length) return { children: children }

  const beatParagraphs = beats.flatMap((beat) => {
    const uniqueBeatTitleSelector = makeBeatTitleSelector(state)
    const title = uniqueBeatTitleSelector(state, beat.id)
    let paragraphs = [new Paragraph('')]
    paragraphs.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }))

    const cards = beatCardMapping[beat.id]
    const customAttrs = cardsCustomAttributesSelector(state)
    const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)
    let cardParagraphs = sortedCards.flatMap((c) =>
      card(c, linesById, namesMapping, customAttrs, doc)
    )

    return paragraphs.concat(cardParagraphs)
  })

  return { children: children.concat(beatParagraphs) }
}

function card(card, linesById, namesMapping, customAttrs, doc) {
  let paragraphs = [new Paragraph('')]
  let line = linesById[card.lineId]
  let titleString = card.title
  if (line) {
    titleString = `${card.title} (${line.title})`
  }
  paragraphs.push(new Paragraph({ text: titleString, heading: HeadingLevel.HEADING_3 }))
  paragraphs = [
    ...paragraphs,
    ...exportItemAttachments(card, namesMapping),
    ...serialize(card.description, doc),
    ...exportCustomAttributes(card, customAttrs, HeadingLevel.HEADING_4, doc),
    ...exportItemTemplates(card, HeadingLevel.HEADING_4, doc),
  ]

  return paragraphs
}
