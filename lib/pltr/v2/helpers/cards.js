import { sortBy, groupBy } from 'lodash'

export function sortCardsInBeat(autoSort, cards, sortedLines) {
  if (autoSort) {
    // group by position within the line
    // for each position, sort those cards by the order of the lines
    const groupedCards = groupBy(cards, 'positionWithinLine')
    const sortedLineIds = sortedLines.map((l) => l.id)
    return Object.keys(groupedCards).flatMap((position) => {
      return groupedCards[position].sort(
        (a, b) => sortedLineIds.indexOf(a.lineId) - sortedLineIds.indexOf(b.lineId)
      )
    })
  } else {
    return sortBy(cards, 'positionInBeat')
  }
}

export function cardMapping(sortedBeats, sortedLines, card2Dmap, currentLine) {
  return sortedBeats.reduce((acc, beat) => {
    acc[beat.id] = sortedBeatCards(sortedLines, beat.id, card2Dmap, currentLine)
    return acc
  }, {})
}

export function emptyCard(id, beat, line) {
  return {
    beatId: beat.id,
    bookId: beat.bookId,
    characters: [],
    color: null,
    description: [
      {
        0: {
          children: [{ 0: { text: beat.title } }],
          type: 'paragraph',
        },
      },
    ],
    fromTemplateId: null,
    id,
    imageId: null,
    lineId: line.id,
    places: [],
    positionInBeat: 0,
    positionWithinLine: 0,
    tags: [],
    templates: [],
    title: beat.title,
    isEmpty: true,
  }
}

function lineIsHidden(line, currentLine) {
  if (Array.isArray(currentLine)) {
    return !currentLine.includes(line.id)
  } else if (!currentLine) return false
  else return line.id !== currentLine
}

function sortedBeatCards(sortedLines, beatId, card2Dmap, currentLine) {
  return sortedLines.reduce((acc, l) => {
    if (lineIsHidden(l, currentLine)) return acc

    const cards = card2Dmap[`${l.id}-${beatId}`]
    if (cards) {
      return acc.concat(cards)
    } else {
      return acc
    }
  }, [])
}

export function truncateTitle(title, maxLength) {
  if (!title) return ''
  if (title.length < maxLength) return title
  return title.substr(0, maxLength) + '...'
}

export const richContentIsNonEmpty = (children) => {
  if (typeof children === 'undefined' || children === null) {
    return false
  }

  if (typeof children === 'string') {
    return children.length !== 0
  }

  return (
    children.length > 1 ||
    children.some((element) => {
      return (
        (element.text && element.text !== '') ||
        (Array.isArray(element.children) && richContentIsNonEmpty(element.children))
      )
    })
  )
}
