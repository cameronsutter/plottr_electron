import { sortBy, groupBy } from 'lodash'

export function sortCardsInChapter(autoSort, cards, sortedLines) {
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
    return sortBy(cards, 'positionInChapter')
  }
}

export function cardMapping(sortedChapters, sortedLines, card2Dmap, currentLine) {
  return sortedChapters.reduce((acc, ch) => {
    acc[ch.id] = sortedChapterCards(sortedLines, ch.id, card2Dmap, currentLine)
    return acc
  }, {})
}

function lineIsHidden(line, currentLine) {
  if (!currentLine) return false
  return line.id != currentLine
}

function sortedChapterCards(sortedLines, chapterId, card2Dmap, currentLine) {
  return sortedLines.reduce((acc, l) => {
    if (lineIsHidden(l, currentLine)) return acc

    const cards = card2Dmap[`${l.id}-${chapterId}`]
    if (cards) {
      return acc.concat(cards)
    } else {
      return acc
    }
  }, [])
}

export function truncateTitle(title, maxLength) {
  if (title.length < maxLength) return title
  return title.substr(0, maxLength) + '...'
}
