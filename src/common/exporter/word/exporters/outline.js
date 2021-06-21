import { keyBy, includes } from 'lodash'
import { t } from 'plottr_locales'
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

export default function exportOutline(state, namesMapping, doc, options) {
  // get current book id and select only those beats/lines/cards
  const beats = sortedBeatsByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const outlineFilter = state.ui.outlineFilter
  const outlineExportFilter = options.outline.filter
  const card2Dmap = cardMapSelector(state)
  const beatCardMapping = cardMapping(beats, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')

  let children = []

  if (options.outline.heading) {
    children.push(
      new Paragraph({
        text: t('Outline'),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  if (!beats.length) return { children: children }

  const getFilteredCards = (cards) => {
    if (outlineExportFilter) {
      return cards.filter((card) => includes(outlineExportFilter, card.lineId))
    } else if (!outlineExportFilter && outlineFilter) {
      return cards.filter((card) => includes(outlineFilter, card.lineId))
    } else {
      return cards
    }
  }

  const beatParagraphs = beats.flatMap((beat) => {
    const uniqueBeatTitleSelector = makeBeatTitleSelector(state)
    const title = uniqueBeatTitleSelector(state, beat.id)
    let paragraphs = [new Paragraph('')]

    if (!options.outline.sceneCards) {
      paragraphs.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }))
    } else {
      const cards = beatCardMapping[beat.id]
      const customAttrs = cardsCustomAttributesSelector(state)
      const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)

      const filteredCards = getFilteredCards(sortedCards)

      if (filteredCards.length) {
        paragraphs.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_2 }))
      }

      const cardParagraphs = filteredCards.flatMap((c) => {
        return card(c, linesById, namesMapping, customAttrs, doc, options)
      })
      paragraphs = [...paragraphs, ...cardParagraphs]
    }

    return paragraphs
  })

  return { children: [...children, ...beatParagraphs] }
}

function card(card, linesById, namesMapping, customAttrs, doc, options) {
  let paragraphs = [new Paragraph('')]
  let line = linesById[card.lineId]
  let titleString = card.title
  if (line) {
    if (options.outline.plotlineInTitle) {
      titleString = `${card.title} (${line.title})`
    } else {
      titleString = card.title
    }
  }
  paragraphs.push(new Paragraph({ text: titleString, heading: HeadingLevel.HEADING_3 }))

  if (options.outline.attachments) {
    paragraphs = [...paragraphs, ...exportItemAttachments(card, namesMapping)]
  }
  if (options.outline.description) {
    paragraphs = [...paragraphs, ...serialize(card.description, doc)]
  }
  if (options.outline.customAttributes) {
    paragraphs = [
      ...paragraphs,
      ...exportCustomAttributes(card, customAttrs, HeadingLevel.HEADING_4, doc),
    ]
  }
  if (options.outline.templates) {
    paragraphs = [...paragraphs, ...exportItemTemplates(card, HeadingLevel.HEADING_4, doc)]
  }

  return paragraphs
}
