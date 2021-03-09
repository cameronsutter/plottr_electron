import { keyBy } from 'lodash'
import i18n from 'format-message'
import { helpers, selectors } from 'pltr/v2'
import { Paragraph, AlignmentType, HeadingLevel } from 'docx'
import serialize from '../../../slate_serializers/to_word'

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

export default function exportOutline(state, namesMapping, bookId, doc) {
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
    let cardParagraphs = sortedCards.flatMap((c) => card(c, linesById, namesMapping, doc))

    return paragraphs.concat(cardParagraphs)
  })

  return { children: children.concat(beatParagraphs) }
}

function card(card, linesById, namesMapping, doc) {
  let paragraphs = [new Paragraph('')]
  let line = linesById[card.lineId]
  let titleString = card.title
  if (line) {
    titleString = `${card.title} (${line.title})`
  }
  let attachmentParagraphs = attachments(card, namesMapping)
  paragraphs.push(new Paragraph({ text: titleString, heading: HeadingLevel.HEADING_3 }))
  paragraphs = paragraphs.concat(attachmentParagraphs)
  const descParagraphs = serialize(card.description, doc)

  // TODO:
  //   - card custom attributes
  //   - card template attributes
  // (use the customAttrs selector above)

  return paragraphs.concat(descParagraphs)
}

function attachments(obj, namesMapping) {
  let paragraphs = []
  let characters = []
  let places = []
  let tags = []

  if (obj.characters) characters = obj.characters.map((ch) => namesMapping.characters[ch])
  if (obj.places) places = obj.places.map((pl) => namesMapping.places[pl])
  if (obj.tags) tags = obj.tags.map((tg) => namesMapping.tags[tg])

  if (characters.length) {
    paragraphs.push(new Paragraph(`${i18n('Characters')}: ${characters.join(', ')}`))
  }
  if (places.length) {
    paragraphs.push(new Paragraph(`${i18n('Places')}: ${places.join(', ')}`))
  }
  if (tags.length) {
    paragraphs.push(new Paragraph(`${i18n('Tags')}: ${tags.join(', ')}`))
  }
  if (paragraphs.length) {
    paragraphs.push(new Paragraph(''))
  }
  return paragraphs
}
