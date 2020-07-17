import { sortBy, groupBy } from 'lodash'

export function sortCardsInChapter (autoSort, cards, sortedLines, isSeries) {
  if (autoSort) {
    const idAttr = isSeries ? 'seriesLineId' : 'lineId'
    // group by position within the line
    // for each position, sort those cards by the order of the lines
    const groupedCards = groupBy(cards, 'positionWithinLine')
    const sortedLineIds = sortedLines.map(l => l.id)
    return Object.keys(groupedCards).flatMap(position => {
      return groupedCards[position].sort((a, b) => sortedLineIds.indexOf(a[idAttr]) - sortedLineIds.indexOf(b[idAttr]))
    })
  } else {
    return sortBy(cards, 'positionInChapter')
  }
}