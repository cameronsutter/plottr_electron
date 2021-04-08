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

function lineIsHidden(line, currentLine) {
  // if no outlinefilter return all
  if (Array.isArray(currentLine) && !currentLine.length) return !currentLine
  if (Array.isArray(currentLine) && currentLine.length) return !currentLine.includes(line.id)
  // if file has no outlineFilter saved in redux
  else if (!currentLine) {
    return false
  } else if (!!currentLine) return line.id != currentLine
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
  if (title.length < maxLength) return title
  return title.substr(0, maxLength) + '...'
}
